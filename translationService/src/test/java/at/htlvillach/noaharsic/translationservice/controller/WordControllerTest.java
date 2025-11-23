package at.htlvillach.noaharsic.translationservice.controller;

import at.htlvillach.noaharsic.translationservice.model.Word;
import at.htlvillach.noaharsic.translationservice.service.LanguageService;
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
public class WordControllerTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private LanguageService languageService;

    @Test
    void getTranslationsForWords() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/words/4/translated/3"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].vocable").isNotEmpty())
                .andExpect(jsonPath("$[0].vocable").value("correre"))
                .andExpect(jsonPath("$[0].language.identifier").value("Italian"));
    }

    @Test
    void getTranslationsSameLanguage() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/words/4/translated/1"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void getWordsOfLanguage() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/words/languages/1"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[*].vocable").isNotEmpty())
                .andExpect(jsonPath("$[0].vocable").value("Haus"))
                .andExpect(jsonPath("$[0].language.identifier").value("German"));
    }

    @Test
    void getWordsOfLanguageNotExist() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/words/languages/10"))
                .andDo(print())
                .andExpect(status().isNotFound());
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
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vocable").value("Trostlosigkeit"))
                .andExpect(jsonPath("$.language.identifier").value("German"));
    }

    @Test
    void createInvalidLanguage() throws Exception {
        Word word = new Word(0, languageService.getById(5), "Trostlosigkeit", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvalidString() throws Exception {
        Word word = new Word(0, languageService.getById(1), "", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/words")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update() throws Exception {
        Word word = new Word(1, languageService.getById(1), "Trostlosigkeit", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/words/1")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.vocable").value("Trostlosigkeit"))
                .andExpect(jsonPath("$.language.identifier").value("German"));;
    }

    @Test
    void createInvalidId() throws Exception {
        Word word = new Word(2, languageService.getById(5), "Trostlosigkeit", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/words/1")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }


    @Test
    void updateInvalidLanguage() throws Exception {
        Word word = new Word(1, languageService.getById(5), "Trostlosigkeit", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/words/1")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvalidString() throws Exception {
        Word word = new Word(1, languageService.getById(1), "", new LinkedList<>());
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/words/1")
                        .content(asJsonString(word))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
