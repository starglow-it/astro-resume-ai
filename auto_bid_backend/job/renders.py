
# In your_app/renderers.py
from rest_framework.renderers import JSONRenderer
import json

class CustomJSONRenderer(JSONRenderer):
    """
    A custom JSON renderer that handles NaN, Infinity, and -Infinity.
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        def default(obj):
            # Convert problematic values to None (or another placeholder of your choice)
            if isinstance(obj, float) and (obj != obj or obj == float('inf') or obj == float('-inf')):
                return None
            raise TypeError
        
        response_data = json.dumps(data, default=default, ensure_ascii=False, allow_nan=False)
        return super().render(response_data, accepted_media_type, renderer_context)
