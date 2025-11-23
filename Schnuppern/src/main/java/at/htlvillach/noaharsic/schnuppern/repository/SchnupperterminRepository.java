package at.htlvillach.noaharsic.schnuppern.repository;

import at.htlvillach.noaharsic.schnuppern.model.Schnuppertermin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchnupperterminRepository extends JpaRepository<Schnuppertermin, Integer> {
}
