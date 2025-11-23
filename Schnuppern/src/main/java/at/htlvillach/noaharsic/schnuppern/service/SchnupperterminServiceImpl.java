package at.htlvillach.noaharsic.schnuppern.service;

import at.htlvillach.noaharsic.schnuppern.model.Schnuppertermin;
import at.htlvillach.noaharsic.schnuppern.repository.SchnupperterminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchnupperterminServiceImpl implements SchnupperterminService{
    @Autowired
    SchnupperterminRepository schnupperterminRepository;

    @Override
    public List<Schnuppertermin> getAll() {
        return schnupperterminRepository.findAll();
    }

    @Override
    public Schnuppertermin getById(int id) {
        return schnupperterminRepository.findById(id).orElse(null);
    }

    @Override
    public boolean delete(int id) {
        try {
            schnupperterminRepository.deleteById(id);
            return true;
        }catch (Exception ex){
            return false;
        }
    }

    @Override
    public Schnuppertermin upsert(Schnuppertermin schnuppertermin) {
        return schnupperterminRepository.saveAndFlush(schnuppertermin);
    }
}
