package zone.sona.member.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import zone.sona.member.domain.Member;
import zone.sona.member.dto.MemberResponse;
import zone.sona.member.repository.MemberRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;

    public MemberResponse findMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return MemberResponse.builder()
                .id(member.getId())
                .build();
    }
}
