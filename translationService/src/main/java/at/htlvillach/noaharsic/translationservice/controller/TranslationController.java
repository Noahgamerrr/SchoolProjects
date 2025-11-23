package at.htlvillach.noaharsic.translationservice.controller;

import at.htlvillach.noaharsic.translationservice.model.Translation;
import at.htlvillach.noaharsic.translationservice.model.Word;
import at.htlvillach.noaharsic.translationservice.service.LanguageService;
import at.htlvillach.noaharsic.translationservice.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
public class TranslationController {
    @Autowired
    private TranslationService translationService;

    @Autowired
    private LanguageService languageService;

    @GetMapping("/translations")
    public ResponseEntity<List<Translation>> getTranslations(
            @RequestParam("fromLanguage") Optional<Integer> fromLanguage,
            @RequestParam("toLanguage") Optional<Integer> toLanguage
    ) {
        if (fromLanguage.isEmpty() || toLanguage.isEmpty()) return ResponseEntity.badRequest().build();
        if (fromLanguage.get().equals(toLanguage.get())) return ResponseEntity.badRequest().build();
        if (languageService.getById(fromLanguage.get()) == null ||
            languageService.getById(toLanguage.get()) == null) return ResponseEntity.notFound().build();
        List<Translation> ts =
                translationService.getTranslationsByLanguages(fromLanguage.get(), toLanguage.get());
        return ResponseEntity.ok().body(ts);

    }

    @PostMapping("/translations")
    public ResponseEntity<List<Translation>> createTranslation(@RequestBody Translation translation) {
        if (
                translation.getTranslated() == null ||
                translation.getToTranslate() == null ||
                translation.getTranslated().getLanguage().getId() ==
                        translation.getToTranslate().getLanguage().getId()
        ) return ResponseEntity.badRequest().build();
        List<Translation> translations = new ArrayList<>();
        Translation t = translationService.upsert(translation);
        if (t == null) return ResponseEntity.badRequest().build();
        translations.add(t);
        Word helper = translation.getToTranslate();
        translation.setToTranslate(translation.getTranslated());
        translation.setTranslated(helper);
        translations.add(translationService.upsert(translation));
        return ResponseEntity.ok().body(translations);
    }
}
