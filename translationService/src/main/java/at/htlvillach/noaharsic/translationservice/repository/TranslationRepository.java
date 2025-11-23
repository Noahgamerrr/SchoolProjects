package at.htlvillach.noaharsic.translationservice.repository;

import at.htlvillach.noaharsic.translationservice.model.Translation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TranslationRepository extends JpaRepository<Translation, Integer> {
}
