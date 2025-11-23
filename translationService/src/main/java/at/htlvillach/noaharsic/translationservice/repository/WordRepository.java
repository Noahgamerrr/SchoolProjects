package at.htlvillach.noaharsic.translationservice.repository;

import at.htlvillach.noaharsic.translationservice.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordRepository extends JpaRepository<Word, Integer> {
}
