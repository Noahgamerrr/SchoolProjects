package at.htlvillach.noaharsic.translationservice.service;

import at.htlvillach.noaharsic.translationservice.model.Word;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface WordService {
    List<Word> getAll();
    Word getById(int id);
    boolean delete(int id);
    Word upsert(Word word);
    List<Word> getTranslations(int id, int lid);
    List<Word> getLanguageWords(int lid);
}
