# El jardín de las delicias

Photo booth MUPI Volvo: elige una naturaleza, hazte una foto y Gemini la transforma con el prompt de esa naturaleza.

## Flujo

1. Selección — 5 naturalezas
2. Captura — 1 a 4 personas
3. Resultado — retrato editorial 4:5

## Arranque

```bash
npm install
cp .env.example .env.local   # GOOGLE_API_KEY o GEMINI_API_KEY
npm run dev
```

Abre http://localhost:8080. La cámara necesita Chrome o Safari.

Prompts y copy: `config/clients/volvo/`. Miniaturas: `public/referencias_tarjetas/`.
