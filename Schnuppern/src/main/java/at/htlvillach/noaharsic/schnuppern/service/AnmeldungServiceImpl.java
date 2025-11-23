package at.htlvillach.noaharsic.schnuppern.service;

import at.htlvillach.noaharsic.schnuppern.model.Anmeldung;
import at.htlvillach.noaharsic.schnuppern.repository.AnmeldungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnmeldungServiceImpl implements AnmeldungService{
    @Autowired
    AnmeldungRepository anmeldungRepository;

    @Override
    public List<Anmeldung> getAll() {
        return anmeldungRepository.findAll();
    }

    @Override
    public Anmeldung getById(int id) {
        return anmeldungRepository.findById(id).orElse(null);
    }

    @Override
    public boolean delete(int id) {
        try {
            anmeldungRepository.deleteById(id);
            return true;
        }catch (Exception ex){
            return false;
        }
    }

    @Override
    public Anmeldung upsert(Anmeldung anmeldung) {
        return anmeldungRepository.saveAndFlush(anmeldung);
    }
}
