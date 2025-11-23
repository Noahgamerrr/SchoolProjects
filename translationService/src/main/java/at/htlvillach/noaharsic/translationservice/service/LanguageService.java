package at.htlvillach.noaharsic.translationservice.service;

import at.htlvillach.noaharsic.translationservice.model.Language;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface LanguageService {
    List<Language> getAll();
    Language getById(int id);
    boolean delete(int id);
    Language upsert(Language language);
}
