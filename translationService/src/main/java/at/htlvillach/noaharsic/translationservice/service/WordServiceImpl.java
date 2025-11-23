package at.htlvillach.noaharsic.translationservice.service;

import at.htlvillach.noaharsic.translationservice.model.Language;
import at.htlvillach.noaharsic.translationservice.model.Translation;
import at.htlvillach.noaharsic.translationservice.model.Word;
import at.htlvillach.noaharsic.translationservice.repository.LanguageRepository;
import at.htlvillach.noaharsic.translationservice.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;

@Service
public class WordServiceImpl implements WordService {
    @Autowired
    private WordRepository wordRepository;
    @Autowired
    private LanguageRepository languageRepository;

    @Override
    public List<Word> getAll() {
        return wordRepository.findAll();
    }

    @Override
    public Word getById(int id) {
        return wordRepository.findById(id).orElse(null);
    }

    @Override
    public boolean delete(int id) {
        Word word = wordRepository.findById(id).orElse(null);
        if (word != null) {
            wordRepository.delete(word);
            return true;
        }
        return false;
    }

    @Override
    public Word upsert(Word word) {
        return wordRepository.saveAndFlush(word);
    }

    @Override
    public List<Word> getTranslations(int id, int lid) {
        Word word = wordRepository.findById(id).orElse(null);
        if (word == null) return new LinkedList<>();
        return word.getTranslations()
                .stream()
                .map(Translation::getTranslated)
                .filter(w -> w.getLanguage().getId() == lid).toList();
    }

    @Override
    public List<Word> getLanguageWords(int lid) {
        Language language = languageRepository.findById(lid).orElse(null);
        if (language == null) return new LinkedList<>();
        return language.getWords();
    }
}
