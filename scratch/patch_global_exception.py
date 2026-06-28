with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

exception_handler = """
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("GLOBAL EXCEPTION:", exc)
    return JSONResponse(
        status_code=400,
        content={"detail": "GLOBAL CRASH: " + str(exc), "traceback": traceback.format_exc()}
    )

"""

if "global_exception_handler" not in content:
    content = content.replace("app = FastAPI(", "app = FastAPI()\n" + exception_handler.replace("app = FastAPI()", ""))

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched global exception.")
