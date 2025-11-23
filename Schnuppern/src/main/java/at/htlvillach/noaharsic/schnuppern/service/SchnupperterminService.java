package at.htlvillach.noaharsic.schnuppern.service;

import at.htlvillach.noaharsic.schnuppern.model.Schnuppertermin;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface SchnupperterminService {
    List<Schnuppertermin> getAll();
    Schnuppertermin getById(int id);
    boolean delete(int id);
    Schnuppertermin upsert(Schnuppertermin schnuppertermin);
}
