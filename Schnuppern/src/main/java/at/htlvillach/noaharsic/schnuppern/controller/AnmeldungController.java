package at.htlvillach.noaharsic.schnuppern.controller;

import at.htlvillach.noaharsic.schnuppern.model.Anmeldung;
import at.htlvillach.noaharsic.schnuppern.service.AnmeldungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.support.NullValue;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AnmeldungController {
    @Autowired
    AnmeldungService anmeldungService;

    @GetMapping("/anmeldungen")
    public List<Anmeldung> getAll() {
        return anmeldungService.getAll();
    }

    @GetMapping("/anmeldungen/{id}")
    public ResponseEntity<Anmeldung> getAllCompanies(@PathVariable int id ) {
        Anmeldung anmeldung = anmeldungService.getById(id);
        if( anmeldung != null ) {
            return new ResponseEntity<>(anmeldung, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/anmeldungen")
    public ResponseEntity<Anmeldung> createCategory(@RequestBody Anmeldung anmeldung ){
        if( anmeldung.getSchnuppertermin() != null )
            anmeldung.getSchnuppertermin().getAnmeldungen().add(anmeldung);
        Anmeldung newAnmeldung = anmeldungService.upsert(anmeldung);
        if( newAnmeldung != null){
            return new ResponseEntity<>(newAnmeldung, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
    @PutMapping("/anmeldungen/{id}")
    public ResponseEntity<Anmeldung> updateCategory(@RequestBody Anmeldung anmeldung, @PathVariable int id ){
        Anmeldung updatedAnmeldung;
        if( anmeldung.getId() == id ) {
            if (anmeldung.getSchnuppertermin() != null)
                anmeldung.getSchnuppertermin().getAnmeldungen().add(anmeldung);
            updatedAnmeldung = anmeldungService.upsert(anmeldung);
            if( updatedAnmeldung != null ){
                return new ResponseEntity<>(updatedAnmeldung, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping( value="/anmeldungen/{id}")
    public ResponseEntity<NullValue> delete(@PathVariable Integer id){
        if(anmeldungService.delete(id)) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
