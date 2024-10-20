const request = require('supertest');
const { app, close } = require('./app');

// 1) Test della GET di tutti i libri
describe("test di tutti gli endpoint dell'API", () => {
    it("La GET di /api/libri deve restituire tutti i libri", async () => {
        const res = await request(app).get("/api/libri");
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();      
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    codice: expect.any(String),
                    nome: expect.any(String),
                    descrizione: expect.any(String),
                    quantita: expect.any(Number),
                    prezzo: expect.any(Number),
                    autore: expect.any(String)
                })
            ])
        );
    });
});


// 2) Test del findByCodice
describe("GET /api/libri/:varCodice", () => {
    it("Dovrebbe restituire un libro quando il codice esiste (A123)", async () => {
        const codiceLibro = "A123";
        const res = await request(app).get(`/api/libri/${codiceLibro}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "codice": "A123",
            "nome": "Libro 2",
            "descrizione": "horror",
            "quantita": 3,
            "prezzo": 15,
            "autore": "Autore 2"
        });
    });

    it("Dovrebbe restituire un errore quando il codice non esiste", async () => {
        const codiceInesistente = "721";
        const res = await request(app).get(`/api/libri/${codiceInesistente}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Errore , il libro non è stato trovato"
        });
    });
});


// 3) Test della POST
describe("POST /api/libri", () => {
    it("Dovrebbe inserire un nuovo libro correttamente", async () => {
        const nuovoLibro = {
            nom: "Libro 5",
            des: "Fantascienza",
            qua: 4,
            pre: 30,
            aut: "Autore 5"
        };

        const res = await request(app)
            .post("/api/libri")
            .send(nuovoLibro);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Success"
        });

        const resGet = await request(app).get("/api/libri");
        const libroAggiunto = resGet.body.find(libro => libro.nome === "Libro 5");

        expect(libroAggiunto).toBeDefined();
        expect(libroAggiunto.descrizione).toEqual("Fantascienza");
        expect(libroAggiunto.quantita).toEqual(4);
        expect(libroAggiunto.prezzo).toEqual(30);
        expect(libroAggiunto.autore).toEqual("Autore 5");
    });

    it("Dovrebbe restituire un errore quando si inserisce un libro con un codice già esistente", async () => {
        const libroEsistente = {
            nom: "Libro 2",
            des: "horror",
            qua: 3,
            pre: 15,
            aut: "Autore 2"
        };

        const res = await request(app)
            .post("/api/libri")
            .send(libroEsistente);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            "status": "Errore , libro già presente"
        });
    });
});


// 4) Test della GET Incrementa
describe("GET /api/libri/:varCodice/incrementa", () => {
    it("Dovrebbe incrementare la quantità di un libro esistente", async () => {
        const codiceLibro = "A123";
        const res = await request(app).get(`/api/libri/${codiceLibro}/incrementa`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual("Success");
        expect(res.body.quantita).toBeGreaterThan(3);
    });

    it("Dovrebbe restituire un errore se il libro non esiste", async () => {
        const codiceInesistente = "721";
        const res = await request(app).get(`/api/libri/${codiceInesistente}/incrementa`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Errore , il libro non è stato trovato"
        });
    });
});


// 5) Test della GET Decrementa
describe("GET /api/libri/:varCodice/decrementa", () => {
    it("Dovrebbe decrementare la quantità di un libro esistente", async () => {
        const codiceLibro = "B123";
        const res = await request(app).get(`/api/libri/${codiceLibro}/decrementa`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual("Success");
        expect(res.body.quantita).toBeLessThan(5);
    });

    it("Dovrebbe restituire un errore se la quantità è zero", async () => {
        const codiceLibro = "B123";
        await request(app).get(`/api/libri/${codiceLibro}/decrementa`);
        await request(app).get(`/api/libri/${codiceLibro}/decrementa`);
        await request(app).get(`/api/libri/${codiceLibro}/decrementa`);
        await request(app).get(`/api/libri/${codiceLibro}/decrementa`);
        await request(app).get(`/api/libri/${codiceLibro}/decrementa`);

        const res = await request(app).get(`/api/libri/${codiceLibro}/decrementa`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Errore , quantità non disponibile"
        });
    });

    it("Dovrebbe restituire un errore se il libro non esiste", async () => {
        const codiceInesistente = "721";
        const res = await request(app).get(`/api/libri/${codiceInesistente}/decrementa`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Errore , libro non è stato trovato"
        });
    });
});


// 6) Test della DELETE
describe("DELETE /api/libri/:varCodice", () => {
    it("Dovrebbe eliminare un libro esistente", async () => {
        const codiceLibro = "A123";
        const res = await request(app).delete(`/api/libri/${codiceLibro}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Success"
        });

        const resGet = await request(app).get("/api/libri");
        const libroCancellato = resGet.body.find(libro => libro.codice === codiceLibro);

        expect(libroCancellato).toBeUndefined();
    });

    it("Dovrebbe restituire un errore se il libro non esiste", async () => {
        const codiceInesistente = "721";
        const res = await request(app).delete(`/api/libri/${codiceInesistente}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            "status": "Errore , codice non trovato"
        });
    });
});


afterAll((done) => {
    close();
    done();
});

