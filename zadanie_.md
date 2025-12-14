Twoim zadaniem jest: 

- Napisać program testujący wszystkie przesunięcia, wykorzystując technikę brute-force, tzn. program powinien: 
    - dla podanego zaszyfrowanego tekstu kolejno zastosować wszystkie możliwe przesunięcia liter w obrębie alfabetu łacińskiego (26 znaków),
    - dla każdego przesunięcia wygenerować nową wersję tekstu (pozostałe znaki:  spacje, przecinek, kropka, dwukropek, @ pozostają bez zmian),
    - wypisać wszystkie otrzymane wersje. 

- Następnie program powinien automatycznie wykryć, która z wygenerowanych wersji jest poprawną wiadomością w języku polskim, używając: 
    - biblioteki do detekcji języka lub
    - modelu AI / API wspierającego rozpoznawanie języka.

- Na koniec program powinien: 
    - wskazać najbardziej prawdopodobną, poprawnie odszyfrowaną polską wiadomość,
    - wyodrębnić z niej adres e-mail, na który należy wysłać kod z tego zadania.

Zakładany rodzaj szyfru oraz sposób przesuwania liter można wywnioskować z nawiązań do jego nazwy umieszczonych ponizej: 

epomj ezno yudndve.  nuopxuiv diozgdbzixev 
rkgtrv iv ivnuv xjyudzijnx. vwt 
fiiotipjrvx rturvidz, rtngde fjy uvyvidv 
iv:  epomj. ezno.yudndve@vyzkxd. do 

testy:
■ uruchomienie programu i sprawdzenie, czy:
■ generuje wszystkie przesunięcia,
■ wykorzystuje mechanizm detekcji języka (biblioteka lub API),
■ wskazuje najbardziej prawdopodobną polską wersję tekstu,
■ poprawnie wyodrębnia adres e-mail z odszyfrowanej
wiadomości,
■ odszyfrowana wiadomość jest poprawna.