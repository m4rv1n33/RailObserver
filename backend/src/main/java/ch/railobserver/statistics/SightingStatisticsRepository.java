package ch.railobserver.statistics;

import ch.railobserver.sighting.Sighting;
import ch.railobserver.statistics.projection.MonthlyCountProjection;
import ch.railobserver.statistics.projection.StationCountProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SightingStatisticsRepository extends JpaRepository<Sighting, Long> {

    @Query("""
            SELECT s.station AS station, COUNT(s) AS count
            FROM Sighting s
            WHERE s.station IS NOT NULL
            GROUP BY s.station
            ORDER BY COUNT(s) DESC
            """)
    List<StationCountProjection> findMostVisitedStations(Pageable pageable);

    @Query(value = """
            SELECT CAST(EXTRACT(YEAR FROM observed_at) AS INTEGER) AS year,
                   CAST(EXTRACT(MONTH FROM observed_at) AS INTEGER) AS month,
                   COUNT(*) AS count
            FROM sighting
            GROUP BY year, month
            ORDER BY year DESC, month DESC
            """, nativeQuery = true)
    List<MonthlyCountProjection> countByMonth();
}
