from html.parser import HTMLParser
from pathlib import Path
import sys

PAGES = [
    Path("public/hanzi.html"),
    Path("public/hangul.html"),
    Path("public/japanese.html"),
    Path("docs/hanzi.html"),
    Path("docs/hangul.html"),
    Path("docs/japanese.html"),
]
REQUIRED_SCRIPTS = {
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    "js/pdf-utils.js",
}

class ScriptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag != "script":
            return
        attrs = dict(attrs)
        if "src" in attrs:
            self.scripts.append(attrs["src"])


def validate_page(path: Path) -> list[str]:
    parser = ScriptParser()
    parser.feed(path.read_text(encoding="utf-8"))
    errors = []
    missing = REQUIRED_SCRIPTS.difference(parser.scripts)
    if missing:
        errors.append(f"{path}: missing scripts: {', '.join(sorted(missing))}")

    page_script = f"js/{path.stem}.js"
    if page_script not in parser.scripts:
        errors.append(f"{path}: missing page script {page_script}")
    elif "js/pdf-utils.js" in parser.scripts:
        if parser.scripts.index("js/pdf-utils.js") > parser.scripts.index(page_script):
            errors.append(f"{path}: js/pdf-utils.js must load before {page_script}")

    return errors


def main() -> int:
    errors = []
    for page in PAGES:
        errors.extend(validate_page(page))

    for js_path in [
        Path("public/js/hanzi.js"),
        Path("public/js/hangul.js"),
        Path("public/js/japanese.js"),
        Path("docs/js/hanzi.js"),
        Path("docs/js/hangul.js"),
        Path("docs/js/japanese.js"),
    ]:
        contents = js_path.read_text(encoding="utf-8")
        if "AsianLanguagesPdf.downloadElementAsPdf" not in contents:
            errors.append(f"{js_path}: does not use shared PDF downloader")

    if errors:
        print("Static validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Static validation passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
