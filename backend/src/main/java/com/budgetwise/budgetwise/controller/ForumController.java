package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.*;
import com.budgetwise.budgetwise.repository.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Map;

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

    // ✅ FIXED: SAFE + NO LAZY CRASH
    @GetMapping("/posts")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllPosts() {
        List<Post> posts = postRepo.findAllWithCommentsAndSorted();
        List<PostDTO> dtoList = posts.stream().map(PostDTO::from).toList();
        return ResponseEntity.ok(dtoList);
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

    // ✅ SAFE DTO
    static class PostDTO {
        public Long id;
        public String title;
        public String content;
        public String createdAt;
        public int likesCount;
        public String username;

        static PostDTO from(Post p) {
            PostDTO dto = new PostDTO();
            dto.id = p.getId();
            dto.title = p.getTitle();
            dto.content = p.getContent();
            dto.createdAt = p.getCreatedAt().toString();
            dto.likesCount = p.getLikesCount();

            // ✅ Critical FIX: NO LAZY FAILURE
            dto.username = (p.getUser() != null && p.getUser().getUsername() != null)
                    ? p.getUser().getUsername()
                    : "Unknown";

            return dto;
        }
    }
}
