package at.htlvillach.noaharsic.translationservice.service;

import at.htlvillach.noaharsic.translationservice.model.Translation;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface TranslationService {
    List<Translation> getAll();
    Translation getById (int id);
    boolean delete(int id);
    Translation upsert(Translation translation);
    List<Translation> getTranslationsByLanguages(int fid, int tid);
}
