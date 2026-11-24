# AI service

Small HTTP server used by the main app for stories #20 (group similar questions)
and #21 (categories by topic). The main app calls it through `services/aiClient.js`.

## API

| Endpoint | Body | Answer |
|---|---|---|
| `POST /categorize` | `{ "questions": [{ "id": 1, "text": "..." }] }` | `{ "mode", "results": [{ "id", "category" }] }` |
| `POST /group` | same | `{ "mode", "groups": [{ "id", "questionIds": [..] }] }` (only groups of 2+) |
| `GET /health` | - | `{ "status": "ok", "mode" }` |

`mode` is `llm` or `heuristic`.

## Two modes

- **Without `ANTHROPIC_API_KEY`**: local keyword categories and word-overlap grouping. No network needed, good for the demo.
- **With `ANTHROPIC_API_KEY`**: asks an LLM (model from `AI_MODEL`, default `claude-haiku-5-5`). If the call fails, it falls back to the local mode.

## Run locally

```bash
cd ai-service
npm install
npm start            # http://localhost:4000
```

## Run with Docker

```bash
cd ai-service
docker build -t qa-ai-service .
docker run --rm -p 4000:4000 qa-ai-service
# with the LLM:
docker run --rm -p 4000:4000 -e ANTHROPIC_API_KEY=your-key qa-ai-service
```

The main app looks for the service at `http://localhost:4000`. To change it, start the app with `AI_SERVICE_URL` set.