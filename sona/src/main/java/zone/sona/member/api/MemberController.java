package zone.sona.member.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import zone.sona.member.dto.MemberResponse;
import zone.sona.member.service.MemberService;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> findMe(@PathVariable Long id) {
        return ResponseEntity.status(200)
                .body(memberService.findMember(id));
    }
}
