package com.budgetwise.budgetwise.repository;

import com.budgetwise.budgetwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

//Interacts with MySQL via JPA
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}
