package com.budgetwise.budgetwise.repository;

import com.budgetwise.budgetwise.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // ✅ Prevent N+1 + LazyInitializationException
    @Query("""
        SELECT DISTINCT p 
        FROM Post p 
        LEFT JOIN FETCH p.comments 
        ORDER BY p.createdAt DESC
    """)
    List<Post> findAllWithCommentsAndSorted();
}
