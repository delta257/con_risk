from translator import DoubaoTranslator
model = DoubaoTranslator("179ee752-de07-4e32-8d92-29a64bd10aa8")
print(model._call_api("你好"))