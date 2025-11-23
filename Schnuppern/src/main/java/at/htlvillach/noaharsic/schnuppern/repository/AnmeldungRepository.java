package at.htlvillach.noaharsic.schnuppern.repository;

import at.htlvillach.noaharsic.schnuppern.model.Anmeldung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnmeldungRepository extends JpaRepository<Anmeldung, Integer> {
}
