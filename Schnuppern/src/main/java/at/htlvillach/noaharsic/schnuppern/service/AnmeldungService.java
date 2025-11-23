package at.htlvillach.noaharsic.schnuppern.service;

import at.htlvillach.noaharsic.schnuppern.model.Anmeldung;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface AnmeldungService {
    List<Anmeldung> getAll();
    Anmeldung getById(int id);
    boolean delete(int id);
    Anmeldung upsert(Anmeldung anmeldung);
}
