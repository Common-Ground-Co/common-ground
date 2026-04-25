# API Endpoint Rule

When creating any new API endpoint for this project, always follow this pattern:

## File structure

- Controller goes in `server/controllers/<resource>Controller.js`
- Router goes in `server/routes/<resource>.js`
- Route must be mounted in `server/server.js`

## Controller rules

- Import pool from `../config/database.js`
- Every handler is an exported async function: `export const handlerName = async (req, res) => {}`
- Always wrap the entire handler body in try/catch
- On catch, always `console.error(...)` then `res.status(500).json({ error: "..." })`
- Use parameterized queries (`$1, $2`) — never string interpolation in SQL
- Return 404 with `{ error: "X not found" }` when a single row lookup returns nothing
- Return 400 with a descriptive message when required fields are missing from the request body
- Use `RETURNING *` on INSERT, and `RETURNING id` on DELETE
- Use `COALESCE($1, column)` on UPDATE so only provided fields are changed

## Router rules

- Import Router from express: `import { Router } from "express"`
- Import named exports from the controller
- Comment each route with the full HTTP method + path e.g. `// GET /api/studios/:id`
- Export the router as default

## server.js rules

- Import the new router
- Mount it under `/api/<resource-name>` with `app.use(...)`
- Keep all mounts grouped together with a comment

## Example

```js
// GET /api/studios/:id
export const getStudioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM studios WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching studio:", error);
    res.status(500).json({ error: "Failed to fetch studio" });
  }
};
```
