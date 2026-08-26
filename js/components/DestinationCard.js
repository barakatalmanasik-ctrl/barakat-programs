function DestinationCard(destination) {
  return `
    <div class="destination-card" onclick="navigateToPrograms('${destination.name}')" style="background: ${destination.gradient}">
      <div class="destination-card__bg">${destination.emoji}</div>
      <div class="destination-card__overlay"></div>
      <div class="destination-card__info">
        <div class="destination-card__name">${destination.name}</div>
        <div class="destination-card__count">${destination.programCount} برنامج</div>
      </div>
    </div>
  `;
}
