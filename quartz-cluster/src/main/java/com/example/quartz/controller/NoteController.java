package com.example.quartz.controller;

import com.example.quartz.job.BTestJob;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notes")
@Slf4j
public class NoteController {
    public NoteController() {

    }
    @GetMapping
    public String note() {
        try {
            return "BTestJob";
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return "Error";
        }
    }
}
