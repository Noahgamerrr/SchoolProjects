package at.htlvillach.noaharsic.translationservice.service;

import at.htlvillach.noaharsic.translationservice.model.Language;
import at.htlvillach.noaharsic.translationservice.repository.LanguageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LanguageServiceImpl implements LanguageService {
    @Autowired
    private LanguageRepository languageRepository;

    @Override
    public List<Language> getAll() {
        return languageRepository.findAll();
    }

    @Override
    public Language getById(int id) {
        return languageRepository.findById(id).orElse(null);
    }

    @Override
    public boolean delete(int id) {
        try {
            Language language = languageRepository.findById(id).orElse(null);
            assert language != null;
            languageRepository.delete(language);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public Language upsert(Language language) {
        if (language.getIdentifier() == null || language.getIdentifier().isBlank()) return null;
        return languageRepository.saveAndFlush(language);
    }
}
