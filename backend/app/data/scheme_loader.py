import json
import os

SCHEME_DIR = os.path.join(os.path.dirname(__file__), "schemes")


def load_all_schemes() -> list:
    """Load all scheme JSON files from the schemes directory."""
    all_schemes = []
    
    if not os.path.exists(SCHEME_DIR):
        print(f"⚠️ Scheme directory not found: {SCHEME_DIR}")
        return all_schemes
    
    for filename in sorted(os.listdir(SCHEME_DIR)):
        if filename.endswith(".json"):
            filepath = os.path.join(SCHEME_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    schemes = json.load(f)
                    all_schemes.extend(schemes)
                    print(f"  ✅ Loaded {len(schemes)} schemes from {filename}")
            except (json.JSONDecodeError, IOError) as e:
                print(f"  ❌ Error loading {filename}: {e}")
    
    return all_schemes


def get_scheme_by_id(scheme_id: str) -> dict | None:
    """Find a scheme by its ID from the cache."""
    for scheme in SCHEMES_CACHE:
        if scheme["scheme_id"] == scheme_id:
            return scheme
    return None


def get_schemes_by_category(category: str) -> list:
    """Filter schemes by category."""
    return [
        s for s in SCHEMES_CACHE
        if category.lower() in [c.lower() for c in s.get("categories", [])]
    ]


def search_schemes(query: str) -> list:
    """Simple text search across scheme names and descriptions."""
    query_lower = query.lower()
    results = []
    for scheme in SCHEMES_CACHE:
        searchable = " ".join([
            scheme.get("name_en", ""),
            scheme.get("name_hi", ""),
            scheme.get("description_en", ""),
            " ".join(scheme.get("categories", []))
        ]).lower()
        if query_lower in searchable:
            results.append(scheme)
    return results


# Cache all schemes on module import
print("📋 Loading government schemes database...")
SCHEMES_CACHE = load_all_schemes()
print(f"📋 Total schemes loaded: {len(SCHEMES_CACHE)}")
