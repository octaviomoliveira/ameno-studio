"""Prepare native 4K/60 web media from the approved R035 Topaz deliveries.

Original videos and stills remain outside the repository and are never changed.
This script owns only media/r035 and media-manifest.json within this experience.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import time

from PIL import Image

REPO = Path(__file__).resolve().parents[1]
EXPERIENCE = REPO / 'public/experiences/bom-jesus'
MEDIA = EXPERIENCE / 'media/r035'
SCRATCH = REPO / '.codex-bomjesus-r035'
MANIFEST = EXPERIENCE / 'media-manifest.json'
SOURCE_QUEUE = Path('D:/Unreal/Projects/BomJesus/Audit/Interativo_R035/full_queue_GateTV_20261105_032103.json')
STILL_STATUS = Path('D:/Unreal/Projects/BomJesus/Audit/Interativo_R035/compact_stills_4k_status.json')
TOPAZ = Path('D:/Unreal/Projects/BomJesus/Renders/R035_Clean/GateTV_20261105_032103/Delivery/Upscale')
MAX_FILE_BYTES = 95 * 1024 * 1024


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_json(path, data):
    temp = Path(path).with_suffix(Path(path).suffix + '.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    os.replace(temp, path)


def sha256(path):
    result = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def probe(path):
    result = subprocess.run([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
        'stream=codec_name,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_frames,duration:format=duration,size',
        '-of', 'json', str(path)], check=True, capture_output=True, text=True)
    data = json.loads(result.stdout)
    assert len(data['streams']) == 1, str(path)
    stream = data['streams'][0]
    return {'codec': stream['codec_name'], 'width': int(stream['width']), 'height': int(stream['height']),
            'fps': stream['avg_frame_rate'], 'frames': int(stream['nb_frames']),
            'duration': float(data['format']['duration']), 'bytes': int(data['format']['size']),
            'pixelFormat': stream['pix_fmt']}


def verify_video(data, source=None):
    assert (data['width'], data['height'], data['fps']) == (3840, 2160, '60/1'), data
    assert data['codec'] == 'h264' and data['pixelFormat'] == 'yuv420p', data
    assert data['frames'] > 0 and data['duration'] > 0 and data['bytes'] > 0
    if source:
        assert data['frames'] == source['frames'], (data, source)
        assert abs(data['duration'] - source['duration']) <= 1 / 60 + 0.001, (data, source)
        assert data['bytes'] < MAX_FILE_BYTES, data


def plan():
    SCRATCH.mkdir(parents=True, exist_ok=True)
    MEDIA.mkdir(parents=True, exist_ok=True)
    exclude = REPO / '.git/info/exclude'
    excluded = exclude.read_text(encoding='utf-8')
    if '/.codex-bomjesus-r035/' not in excluded.splitlines():
        with exclude.open('a', encoding='utf-8') as stream:
            stream.write('\n/.codex-bomjesus-r035/\n')
    queue = [r for r in read_json(SOURCE_QUEUE) if r['stage'] == 'compact']
    assert len(queue) == 27
    still_state = read_json(STILL_STATUS)
    assert still_state['phase'] == 'complete'
    stills = read_json(still_state['manifest'])
    assert len(stills) == 28
    jpgs = {r['poster_id']: Path(r['delivery_jpg']) for r in stills}
    for key, source in jpgs.items():
        with Image.open(source) as image:
            assert image.size == (3840, 2160), source
            image.verify()
        destination = MEDIA / (key + '_4k.jpg')
        if destination.exists():
            assert sha256(destination) == sha256(source), 'Refusing to overwrite changed still: ' + key
        else:
            shutil.copy2(source, destination)
    previous = read_json(MANIFEST) if MANIFEST.exists() else {}
    clips = {}
    jobs = []
    topaz_files = list(TOPAZ.glob('*.mp4'))
    for row in queue:
        key = row['id'].removeprefix('video_')
        candidates = [p for p in topaz_files if p.name.startswith(row['id'] + '_')]
        assert len(candidates) == 1, (key, candidates)
        source = candidates[0]
        source_info = probe(source)
        verify_video(source_info)
        source_hash = sha256(source)
        target = MEDIA / (key + '_4k60.mp4')
        ready = False
        output_info = None
        if target.exists():
            prior = previous.get('clips', {}).get(key, {})
            assert prior.get('sourceSha256') == source_hash, 'Refusing to reuse output from another source.'
            output_info = probe(target)
            verify_video(output_info, source_info)
            ready = True
        clips[key] = {
            'src': 'media/r035/' + target.name,
            'poster': 'media/r035/' + key + '_4k.jpg',
            'width': 3840, 'height': 2160, 'fps': 60,
            'sourceFrames': source_info['frames'], 'sourceDuration': source_info['duration'],
            'duration': source_info['duration'], 'sourceSha256': source_hash,
            'sourceFile': source.name, 'sourceBytes': source_info['bytes'],
            'outputBytes': output_info['bytes'] if output_info else None,
            'ready': ready, 'originalRenderFrames': row['last'], 'originalRenderFps': 24,
            'originalRenderDuration': row['last'] / 24,
            'stillFrame': row['last'] - 1,
        }
        jobs.append({'key': key, 'source': str(source), 'target': str(target), 'sourceInfo': source_info})
    ordered = sorted(jobs, key=lambda j: (j['key'] != 'LIGHT_DEMO_welcome', -j['sourceInfo']['duration']))
    manifest = {
        'version': 'r035', 'scope': 'compact', 'complete': all(r['ready'] for r in clips.values()),
        'generalPoster': 'media/r035/General_4k.jpg',
        'quality': {'nativeResolution': [3840, 2160], 'videoFps': 60, 'codec': 'h264',
                    'webEncoder': 'libx264', 'preset': 'medium', 'crf': 19,
                    'maxRateMbps': 35, 'bufferMbps': 70, 'pixelFormat': 'yuv420p',
                    'fastStart': True, 'audio': False, 'resize': False, 'frameRateConversion': False,
                    'stills': 'Original native 4K JPEG delivery, copied byte-for-byte; no resize.'},
        'counts': {'videos': 27, 'stills': 28}, 'clips': clips,
        'stills': {key: {'src': 'media/r035/' + key + '_4k.jpg', 'sha256': sha256(source),
                         'bytes': source.stat().st_size, 'width': 3840, 'height': 2160}
                   for key, source in jpgs.items()},
    }
    write_json(MANIFEST, manifest)
    write_json(SCRATCH / 'jobs.json', ordered)
    return manifest, ordered


def sample_quality(source, output):
    # Same decoded timestamps, 960px luma only: a lightweight compression check.
    source_info = probe(source)
    samples = []
    for seconds in (0.0, source_info['duration'] / 2, max(0.0, source_info['duration'] - 0.10)):
        frames = []
        for path in (source, output):
            command = ['ffmpeg', '-v', 'error', '-threads', '1', '-ss', f'{seconds:.6f}', '-i', str(path),
                       '-an', '-frames:v', '1', '-vf', 'scale=960:540:flags=area', '-pix_fmt', 'gray',
                       '-threads', '1', '-f', 'rawvideo', 'pipe:1']
            raw = subprocess.run(command, check=True, capture_output=True).stdout
            assert len(raw) == 960 * 540, (path, seconds, len(raw))
            frames.append(raw)
        a, b = frames
        n = len(a)
        mean_a, mean_b = sum(a) / n, sum(b) / n
        variance_a = sum((x - mean_a) ** 2 for x in a) / n
        variance_b = sum((x - mean_b) ** 2 for x in b) / n
        covariance = sum((x - mean_a) * (y - mean_b) for x, y in zip(a, b)) / n
        mse = sum((x - y) ** 2 for x, y in zip(a, b)) / n
        c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
        score = ((2 * mean_a * mean_b + c1) * (2 * covariance + c2)) / (
            (mean_a ** 2 + mean_b ** 2 + c1) * (variance_a + variance_b + c2))
        samples.append({'time': seconds, 'lumaRms960': math.sqrt(mse), 'globalSsim960': score})
    return samples


def run():
    manifest, jobs = plan()
    status = {'phase': 'encoding', 'started': time.time(), 'total': len(jobs),
              'completed': [j['key'] for j in jobs if manifest['clips'][j['key']]['ready']], 'failed': []}
    def save(**fields):
        status.update(fields, updated=time.time(), done=len(status['completed']))
        write_json(SCRATCH / 'status.json', status)
    save()
    for job in jobs:
        key = job['key']
        if key in status['completed']:
            continue
        save(current=key)
        temp = SCRATCH / (key + '.partial.mp4')
        log = SCRATCH / (key + '.encode.log')
        progress = SCRATCH / (key + '.progress')
        command = ['ffmpeg', '-hide_banner', '-nostdin', '-y', '-i', job['source'],
                   '-map', '0:v:0', '-map_metadata', '-1', '-an', '-c:v', 'libx264',
                   '-preset', 'medium', '-crf', '19', '-maxrate', '35M', '-bufsize', '70M',
                   '-threads', '6', '-pix_fmt', 'yuv420p', '-fps_mode', 'passthrough',
                   '-movflags', '+faststart', '-progress', str(progress), str(temp)]
        started = time.time()
        try:
            with log.open('w', encoding='utf-8') as stream:
                subprocess.run(command, check=True, stdout=stream, stderr=subprocess.STDOUT, timeout=1800)
            output_info = probe(temp)
            verify_video(output_info, job['sourceInfo'])
            os.replace(temp, job['target'])
            clip = manifest['clips'][key]
            clip.update(ready=True, outputBytes=output_info['bytes'], duration=output_info['duration'],
                        frames=output_info['frames'], outputSha256=sha256(job['target']))
            write_json(MANIFEST, manifest)
            status['completed'].append(key)
            save(last={'key': key, 'seconds': time.time() - started, 'bytes': output_info['bytes']})
            print(f"{len(status['completed'])}/{len(jobs)} {key}: {output_info['bytes'] / 1048576:.1f} MiB", flush=True)
            if key == 'LIGHT_DEMO_welcome':
                assessment = sample_quality(job['source'], job['target'])
                write_json(SCRATCH / 'welcome_quality_check.json', assessment)
        except Exception as exc:
            status['failed'].append({'key': key, 'error': repr(exc)})
            save(phase='failed', current=key)
            raise
    manifest['complete'] = True
    write_json(MANIFEST, manifest)
    save(phase='complete', current=None, finished=time.time(),
         videoBytes=sum(r['outputBytes'] for r in manifest['clips'].values()),
         imageBytes=sum(r['bytes'] for r in manifest['stills'].values()))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan-only', action='store_true')
    args = parser.parse_args()
    if args.plan_only:
        result, tasks = plan()
        print(json.dumps({'videos': len(tasks), 'stills': len(result['stills']), 'manifest': str(MANIFEST)}))
    else:
        run()
