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

    // 📝 Create a new post
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Post post, Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        post.setUser(user);
        postRepo.save(post);
        return ResponseEntity.ok("Post created");
    }

    // 🟦 Get all posts with comments
    @GetMapping("/posts")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllPosts() {

        List<Post> posts = postRepo.findAllWithCommentsAndSorted();

        List<PostDTO> dtoList = posts.stream()
                .map(PostDTO::from)
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    // 💬 Add Comment
    @PostMapping("/comments/{postId}")
    public ResponseEntity<?> addComment(
            @PathVariable Long postId,
            @RequestBody Map<String, String> body,
            Principal principal) {

        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();

        Comment comment = new Comment();
        comment.setContent(body.get("content"));
        comment.setPost(post);
        comment.setUser(user);

        commentRepo.save(comment);

        return ResponseEntity.ok("Comment added");
    }

    // ❤️ Like post
    @PostMapping("/like/{postId}")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        Post post = postRepo.findById(postId).orElseThrow();
        post.setLikesCount(post.getLikesCount() + 1);
        postRepo.save(post);

        return ResponseEntity.ok(Map.of("likes", post.getLikesCount()));
    }

    /* ===========================================================
     *               DTO CLASSES (INSIDE CONTROLLER)
     * =========================================================== */

    // 🔹 CommentDTO
    static class CommentDTO {
        public Long id;
        public String content;
        public String createdAt;
        public String username;

        static CommentDTO from(Comment c) {
            CommentDTO dto = new CommentDTO();
            dto.id = c.getId();
            dto.content = c.getContent();
            dto.createdAt = c.getCreatedAt().toString();
            dto.username = c.getUsername();
            return dto;
        }
    }

    // 🔹 PostDTO
    static class PostDTO {
        public Long id;
        public String title;
        public String content;
        public String createdAt;
        public int likesCount;
        public String username;

        public List<CommentDTO> comments;

        static PostDTO from(Post p) {
            PostDTO dto = new PostDTO();
            dto.id = p.getId();
            dto.title = p.getTitle();
            dto.content = p.getContent();
            dto.createdAt = p.getCreatedAt().toString();
            dto.likesCount = p.getLikesCount();

            dto.username = p.getUser() != null ? p.getUser().getUsername() : "Unknown";

            // 🔥 MAP COMMENTS HERE
            dto.comments = p.getComments()
                    .stream()
                    .map(CommentDTO::from)
                    .toList();

            return dto;
        }
    }
}
