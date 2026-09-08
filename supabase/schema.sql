-- ameno.studio — Schema inicial
-- Rodar no Supabase Dashboard → SQL Editor

-- Projetos do portfólio
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    location TEXT,
    year INT,
    description TEXT,
    cover_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    published BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Compras / apoios (pay-what-you-want)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent TEXT,
    amount INT,
    currency TEXT DEFAULT 'brl',
    customer_email TEXT,
    product TEXT DEFAULT 'ameno-cotas',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Projetos publicados são públicos (leitura sem login)
CREATE POLICY "projects_public_read"
    ON public.projects FOR SELECT
    USING (published = true);

-- Placeholders de projetos
INSERT INTO public.projects (slug, title, category, location, year, cover_url, published, order_index)
VALUES
    ('wesley-dda', 'Wesley DDA', 'Residencial', 'Recife, PE', 2025, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80', true, 1),
    ('interior-01', 'Projeto Interior', 'Interiores', 'São Paulo, SP', 2025, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80', true, 2),
    ('fachada-comercial', 'Fachada Comercial', 'Comercial', 'Recife, PE', 2024, 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80', true, 3),
    ('residencia-contemporanea', 'Residência Contemporânea', 'Residencial', 'Fortaleza, CE', 2024, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80', true, 4),
    ('escritorio-moderno', 'Escritório Moderno', 'Comercial', 'Recife, PE', 2024, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80', true, 5)
ON CONFLICT (slug) DO NOTHING;
