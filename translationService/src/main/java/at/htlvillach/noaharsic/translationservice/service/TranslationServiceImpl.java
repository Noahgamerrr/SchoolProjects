package at.htlvillach.noaharsic.translationservice.service;

import at.htlvillach.noaharsic.translationservice.model.Translation;
import at.htlvillach.noaharsic.translationservice.repository.TranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TranslationServiceImpl implements TranslationService {
    @Autowired
    private TranslationRepository translationRepository;

    @Override
    public List<Translation> getAll() {
        return translationRepository.findAll();
    }

    @Override
    public Translation getById(int id) {
        return translationRepository.findById(id).orElse(null);
    }

    @Override
    public boolean delete(int id) {
        Translation translation = translationRepository.findById(id).orElse(null);
        if (translation != null) {
            translationRepository.delete(translation);
            return true;
        }
        return false;
    }

    @Override
    public Translation upsert(Translation translation) {
        return translationRepository.save(translation);
    }

    @Override
    public List<Translation> getTranslationsByLanguages(int lid, int tid) {
        return translationRepository.findAll().stream()
                .filter(
                        t -> t.getToTranslate().getLanguage().getId() == lid &&
                                t.getTranslated().getLanguage().getId() == tid
                ).toList();
    }
}
