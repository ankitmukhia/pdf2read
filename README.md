## Read pdf with theme toggle

This project uses react-pdf, it works via some simple styling hack. And backend is not associated with frotend, but backend has code of converting pdf to HTML with pdf2htmlex cli tool plus parses most of the junk it created with utility function inside utils/pdfParser.ts.

It uses this exicutable binary inside ./bin/pdf2htmlEX, it takes input file and outputs generated HTML inside outputs folder.

Also it serves static assets generated. For example: http://localhost:PORT/oututs/generatedcontent.html

Backend serves at: http://localhsot:PORT/upload, POST request, send pdf file.
