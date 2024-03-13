package zone.sona.member.dto;

import lombok.Builder;

public class MemberResponse {
    private Long id;

    @Builder
    public MemberResponse(Long id) {
        this.id = id;
    }
}
