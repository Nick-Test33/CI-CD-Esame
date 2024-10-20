const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyparser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyparser.urlencoded({extended: false}));

const host= "127.0.0.1";
const port = 3000;

let Elencolibri = [
    {
        "codice": uuidv4(), 
        "nome": "Libro 1",
        "descrizione": "Fantasy",
        "quantita": 2,
        "prezzo": 10,
        "autore": "Autore 1"
    },
    {
        "codice": uuidv4(), 
        "nome": "Libro 3",
        "descrizione": "Avventura",
        "quantita": 3,
        "prezzo": 20,
        "autore": "Autore 3"
    },
    {
        // codice statico utile per il file app.test.js, perchè devo specificare per forza uno fisso
        "codice": "A123", 
        "nome": "Libro 2",
        "descrizione": "horror",
        "quantita": 3,
        "prezzo": 15,
        "autore": "Autore 2"
    },
    {
        // codice statico utile per il file app.test.js, perchè devo specificare per forza uno fisso
        "codice": "B123", 
        "nome": "Libro 4",
        "descrizione": "horror",
        "quantita": 5,
        "prezzo": 5,
        "autore": "Autore 4"
    }  
];

//  1) GET - Restituisce tutti i libri
app.get("/api/libri", (req, res) => {
    res.json(Elencolibri);
})


//  2) GET - restituisce il libro specifico cercando per il suo codice
app.get("/api/libri/:varCodice", (req, res) => {
    let cod = req.params.varCodice;
    for (let [idx , item] of Elencolibri.entries()) {
        if (item.codice == cod) {
            res.json(item);
        }
    }
    res.json(
        {
            "status": "Errore , il libro non è stato trovato"
        }
    )
})


//  3) POST - Inserisci un libro
app.post("/api/libri", (req, res) => {
    let NuovoLibro = {
        codice: uuidv4(), 
        nome: req.body.nom,
        descrizione: req.body.des,
        quantita: req.body.qua,
        prezzo: req.body.pre,
        autore: req.body.aut
    };

    for (let item of Elencolibri) {
        if (item.nome === NuovoLibro.nome) {
            return res.status(400).json({
                "status": "Errore , libro già presente"
            });
        }
    }

    Elencolibri.push(NuovoLibro);

    res.status(200).json({
        "status": "Success"
    });
});



//  4) GET - Aggiunge 1 unità al libro selezionato
app.get("/api/libri/:varCodice/incrementa", (req, res) => {
    let cod = req.params.varCodice;
    for (let item of Elencolibri) {
        if (item.codice === cod) {
            item.quantita += 1; 

            return res.json({
                "status": "Success",
                "quantita": item.quantita
            });
        }
    }
    res.json({
        "status": "Errore , il libro non è stato trovato"
    });
});



//  5) GET - Sottrae 1 unità al libro selezionato
app.get("/api/libri/:varCodice/decrementa", (req, res) => {
    const cod = req.params.varCodice;
    for (let item of Elencolibri) {
        if (item.codice === cod) {
            if (item.quantita > 0) {
                item.quantita -= 1; 

                return res.json({
                    "status": "Success",
                    "quantita": item.quantita
                });
            } else {
                return res.json({
                    "status": "Errore , quantità non disponibile"
                });
            }
        }
    }
    res.json({
        "status": "Errore , libro non è stato trovato"
    });
});



//  6) DELETE - Elimina singolo libro tramite il suo codice
app.delete("/api/libri/:varCodice", (req, res) => {
    let cod = req.params.varCodice;
    for (let [idx , item] of Elencolibri.entries()) {
        if (item.codice == cod) {
            Elencolibri.splice(idx , 1);
            res.json({
                "status": "Success"
            })
            return;
        }
    }
    res.json({
        "status": "Errore , codice non trovato"
    })
})


const server = app.listen(port, host, () => {
    console.log("Sono in ascolto sulla porta: " + port);
})

const close = () => {
    server.close();
}

module.exports = { app, close }  