package at.htlvillach.noaharsic.translationservice.controller;

import at.htlvillach.noaharsic.translationservice.model.Language;
import at.htlvillach.noaharsic.translationservice.service.LanguageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LanguageController {
    @Autowired
    private LanguageService languageService;

    @GetMapping("/languages")
    public List<Language> getAll() {
        return languageService.getAll();
    }

    @GetMapping("/languages/{id}")
    public ResponseEntity<Language> getById(@PathVariable int id) {
        Language language = languageService.getById(id);
        if (language == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(language);
    }

    @PostMapping("/languages")
    public ResponseEntity<Language> create(@RequestBody Language language) {
        Language l = languageService.upsert(language);
        if (l == null) return ResponseEntity.badRequest().build();
        return new ResponseEntity<>(l, HttpStatus.CREATED);
    }

    @PutMapping("/languages/{id}")
    public ResponseEntity<Language> update(@PathVariable int id, @RequestBody Language language) {
        Language l = languageService.getById(id);
        if (l == null) return ResponseEntity.notFound().build();
        if (language.getId() != l.getId()) return ResponseEntity.badRequest().build();
        Language newLang = languageService.upsert(language);
        if (newLang == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(newLang);
    }

    @DeleteMapping("/languages/{id}")
    public ResponseEntity<Language> delete(@PathVariable int id) {
        Language l = languageService.getById(id);
        if (l == null) return ResponseEntity.notFound().build();
        if (languageService.delete(id))
            return ResponseEntity.noContent().build();
        else return ResponseEntity.badRequest().build();
    }
}
