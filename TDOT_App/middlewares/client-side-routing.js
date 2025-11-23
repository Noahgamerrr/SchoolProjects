import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerClientSideRouting = (app) => {
    // register catch-all route to handle client-side routing with index.html
    app.get("*", (_req, res) => {
        res.sendFile(
            path.join(__dirname, "..", "client", "dist", "index.html")
        );
    });
};

export { registerClientSideRouting };
