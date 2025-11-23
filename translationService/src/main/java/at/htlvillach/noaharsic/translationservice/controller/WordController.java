package at.htlvillach.noaharsic.translationservice.controller;

import at.htlvillach.noaharsic.translationservice.model.Language;
import at.htlvillach.noaharsic.translationservice.model.Word;
import at.htlvillach.noaharsic.translationservice.service.LanguageService;
import at.htlvillach.noaharsic.translationservice.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class WordController {
    @Autowired
    private WordService wordService;

    @Autowired
    private LanguageService languageService;

    @GetMapping("/words")
    public List<Word> getAllWords() {
        return wordService.getAll();
    }

    @GetMapping("/words/{id}/translated/{lid}")
    public ResponseEntity<List<Word>> getTranslations(@PathVariable int id, @PathVariable int lid) {
        Word w = wordService.getById(id);
        if (w.getLanguage().getId() == lid) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(wordService.getTranslations(id, lid));
    }

    @GetMapping("/words/languages/{lid}")
    public ResponseEntity<List<Word>> getLanguageWords(@PathVariable int lid) {
        Language l = languageService.getById(lid);
        if (l == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(wordService.getLanguageWords(lid));
    }

    @PostMapping("/words")
    public ResponseEntity<Word> addWord(@RequestBody Word word) {
        if (word.getLanguage() == null || word.getVocable().isBlank())
            return ResponseEntity.badRequest().build();
        Word w = wordService.upsert(word);
        if (w == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(w);
    }

    @PutMapping("/words/{id}")
    public ResponseEntity<Word> updateWord(@PathVariable int id, @RequestBody Word word) {
        if (id != word.getId() || word.getLanguage() == null || word.getVocable().isBlank())
            return ResponseEntity.badRequest().build();
        Word w = wordService.upsert(word);
        if (w == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(w);
    }
}
