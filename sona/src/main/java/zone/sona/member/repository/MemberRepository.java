package zone.sona.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import zone.sona.member.domain.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
