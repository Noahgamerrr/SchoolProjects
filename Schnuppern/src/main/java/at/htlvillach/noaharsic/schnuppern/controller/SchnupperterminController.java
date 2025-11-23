package at.htlvillach.noaharsic.schnuppern.controller;

import at.htlvillach.noaharsic.schnuppern.model.Schnuppertermin;
import at.htlvillach.noaharsic.schnuppern.service.SchnupperterminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.support.NullValue;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SchnupperterminController {
    @Autowired
    SchnupperterminService schnupperterminService;

    @GetMapping("/schnupperterminen")
    public List<Schnuppertermin> getAll() {
        return schnupperterminService.getAll();
    }

    @GetMapping("/schnupperterminen/{id}")
    public ResponseEntity<Schnuppertermin> getAllCompanies(@PathVariable int id ) {
        Schnuppertermin schnuppertermin = schnupperterminService.getById(id);
        if( schnuppertermin != null ) {
            return new ResponseEntity<>(schnuppertermin, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/schnupperterminen")
    public ResponseEntity<Schnuppertermin> createCategory(@RequestBody Schnuppertermin schnuppertermin ){
        if( schnuppertermin.getAnmeldungen() != null ) {

        }
            schnuppertermin.getSchnuppertermin().getSchnupperterminen().add(schnuppertermin);
        Schnuppertermin newSchnuppertermin = schnupperterminService.upsert(schnuppertermin);
        if( newSchnuppertermin != null){
            return new ResponseEntity<>(newSchnuppertermin, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
    @PutMapping("/schnupperterminen/{id}")
    public ResponseEntity<Schnuppertermin> updateCategory(@RequestBody Schnuppertermin schnuppertermin, @PathVariable int id ){
        Schnuppertermin updatedSchnuppertermin;
        if( schnuppertermin.getId() == id ) {
            if (schnuppertermin.getSchnuppertermin() != null)
                schnuppertermin.getSchnuppertermin().getSchnupperterminen().add(schnuppertermin);
            updatedSchnuppertermin = schnupperterminService.upsert(schnuppertermin);
            if( updatedSchnuppertermin != null ){
                return new ResponseEntity<>(updatedSchnuppertermin, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping( value="/schnupperterminen/{id}")
    public ResponseEntity<NullValue> delete(@PathVariable Integer id){
        if(schnupperterminService.delete(id)) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
