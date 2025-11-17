package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.*;
import com.budgetwise.budgetwise.repository.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "http://localhost:5173")
public class ForumController {

    private final PostRepository postRepo;
    private final CommentRepository commentRepo;
    private final UserRepository userRepo;

    public ForumController(PostRepository postRepo, CommentRepository commentRepo, UserRepository userRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
    }

    // 📝 Create Post
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Post post, Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        post.setUser(user);
        postRepo.save(post);
        return ResponseEntity.ok(post);
    }

    // 📜 Get All Posts
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        return ResponseEntity.ok(postRepo.findAllByOrderByCreatedAtDesc());
    }

    // 💬 Add Comment
    @PostMapping("/comments/{postId}")
    public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody Comment comment, Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
        comment.setUser(user);
        comment.setPost(post);
        commentRepo.save(comment);
        return ResponseEntity.ok(comment);
    }

    // ❤️ Like Post
    @PostMapping("/like/{postId}")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        Post post = postRepo.findById(postId).orElseThrow();
        post.setLikesCount(post.getLikesCount() + 1);
        postRepo.save(post);
        return ResponseEntity.ok(Map.of("likes", post.getLikesCount()));
    }
}
