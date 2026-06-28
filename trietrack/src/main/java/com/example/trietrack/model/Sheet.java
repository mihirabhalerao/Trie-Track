package com.example.trietrack.model;

import com.example.trietrack.model.enums.SheetType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sheets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false, length = 100)
    private SheetType name;
}