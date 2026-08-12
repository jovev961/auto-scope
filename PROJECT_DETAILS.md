Test every route in order
Start with:
http://localhost:3000/api/carspecs/makes
Take a real make ID from the response:
http://localhost:3000/api/carspecs/makes/1/models
Then take a model ID:
http://localhost:3000/api/carspecs/models/25/generations
Then a generation ID:
http://localhost:3000/api/carspecs/generations/100/trims
Finally, take a trim ID:
http://localhost:3000/api/carspecs/trims/500
Replace the example IDs with actual IDs returned by the previous endpoint.