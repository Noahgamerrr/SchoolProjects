package at.htlvillach.noaharsic.translationservice.repository;

import at.htlvillach.noaharsic.translationservice.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LanguageRepository extends JpaRepository<Language, Integer> {
}
