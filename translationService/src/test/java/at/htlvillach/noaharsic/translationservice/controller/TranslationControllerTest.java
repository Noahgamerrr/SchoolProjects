package at.htlvillach.noaharsic.translationservice.controller;


import at.htlvillach.noaharsic.translationservice.model.Translation;
import at.htlvillach.noaharsic.translationservice.model.Word;
import at.htlvillach.noaharsic.translationservice.service.LanguageService;
import at.htlvillach.noaharsic.translationservice.service.WordService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.LinkedList;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("Test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class TranslationControllerTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private LanguageService languageService;

    @Autowired
    private WordService wordService;

    @Test
    void getTranslation() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/translations?fromLanguage=1&toLanguage=3"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[5].toTranslate.language.identifier").value("German"))
                .andExpect(jsonPath("$[5].toTranslate.vocable").value("laufen"))
                .andExpect(jsonPath("$[5].translated.language.identifier").value("Italian"))
                .andExpect(jsonPath("$[5].translated.vocable").value("camminare"));

    }

    @Test
    void getTranslationSameLanguage() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/translations?fromLanguage=1&toLanguage=1"))
                .andDo(print())
                .andExpect(status().isBadRequest());

    }

    @Test
    void getTranslationFromNotExist() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/translations?fromLanguage=10&toLanguage=1"))
                .andDo(print())
                .andExpect(status().isNotFound());

    }

    @Test
    void getTranslationToNotExist() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/translations?fromLanguage=1&toLanguage=10"))
                .andDo(print())
                .andExpect(status().isNotFound());

    }

    @Test
    void getTranslationFromNotGiven() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/translations?toLanguage=1"))
                .andDo(print())
                .andExpect(status().isBadRequest());

    }

    @Test
    void getTranslationToNotGiven() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/translations?fromLanguage=1"))
                .andDo(print())
                .andExpect(status().isBadRequest());

    }

    public static String asJsonString(final Object object) {
        System.out.println(object);
        try {
            return new ObjectMapper().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }


    @Test
    void create() throws Exception {
        Word word = new Word(0, languageService.getById(1), "Trostlosigkeit", new LinkedList<>());
        Word word2 = new Word(0, languageService.getById(2), "Dreariness", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        Translation translation = new Translation(0, wordService.getById(15), wordService.getById(16), 3);
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/translations")
                    .content(asJsonString(translation))
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void createSameLanguage() throws Exception {
        Word word = new Word(0, languageService.getById(1), "Trostlosigkeit", new LinkedList<>());
        Word word2 = new Word(0, languageService.getById(1), "Dreariness", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        Translation translation = new Translation(0, wordService.getById(15), wordService.getById(16), 3);
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/translations")
                        .content(asJsonString(translation))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());;
    }

    @Test
    void createFromMissing() throws Exception {
        Word word2 = new Word(0, languageService.getById(2), "Dreariness", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word2))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());


        Translation translation = new Translation(0, null, wordService.getById(15), 3);
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/translations")
                        .content(asJsonString(translation))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());;
    }

    @Test
    void createToMissing() throws Exception {
        Word word = new Word(0, languageService.getById(1), "Trostlosigkeit", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        Translation translation = new Translation(0, wordService.getById(15), null, 3);
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/translations")
                        .content(asJsonString(translation))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());;
    }
}
