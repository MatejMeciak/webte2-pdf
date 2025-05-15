# 📄 PDF Web App – Projektová Dokumentácia

## ✨ Funkcionality PDF aplikácie

Aplikácia podporuje nasledujúce operácie s PDF súbormi:

- 🔗 **Merge** – zlúčenie viacerých PDF do jedného
- ✂️ **Split** – rozdelenie PDF na viaceré časti
- 🗑 **Vymazanie strany** – odstránenie zvolenej strany z PDF
- 📄 **Extrahovanie strán** – uloženie vybraných strán do nového PDF
- 🔀 **Zmena poradia strán** – reorganizácia strán PDF súboru
- 🔒 **Pridanie hesla** – ochrana PDF súboru heslom
- 🖼 **Konverzia na obrázky** – každá strana PDF ako PNG/JPG
- 📉 **Pridanie vodoznaku** – pridanie vodoznaku na každú stranu PDF
- 🔓 **Odstránenie hesla** – odomknutie chráneného PDF
- 🔄 **Rotácia strán** – otočenie strán o 90/180/270 stupňov

---

## 👥 Rozdelenie úloh v tíme

### 👨‍💻 Martin
- Nastavenie backendu (FastAPI)
- Implementácia všetkých PDF funkcionalít
- Tvorba REST API (vrátane login/registrácie)
- Autentifikácia cez tokeny (JWT)
- Logovanie histórie použitia a jej export do CSV
- OpenAPI dokumentácia (Swagger)
- Príprava SQL skriptov a inicializácia databázy
- Príprava `Dockerfile` a `docker-compose` pre backend

---

### 👨‍🎨 Marek
- Návrh a vývoj responzívneho frontend rozhrania (React + Tailwind)
- Prepojenie s API (tokeny, operácie nad PDF)
- Príprava `Dockerfile` a `docker-compose` pre frontend
- Deploy celej aplikácie na školský server
- Dynamické generovanie PDF používateľskej príručky

---

### 🧑‍💻 Matiko
- Vývoj frontend rozhrania (React)
- Prepojenie s API (token, PDF operácie)
- Admin stránka pre pozeranie histórie akcií užívateľov

---

### 👨‍🏫 Šimon
- Implementácia prihlasovania a registrácie + roly používateľ/admin
- Umiestnenie a zobrazovanie používateľskej príručky na stránke
- Dvojjazyčný režim (SK/EN) s uchovaním aktuálnej stránky
- Tvorba príručky pre používateľov (frontend + API časť)
- Natočenie a zostrih videa prezentujúceho celú funkcionalitu

---
