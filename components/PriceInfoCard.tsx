import Image from "next/image";

interface Props {
  title: string;
  iconSrc: string;
  value: string;
}

const PriceInfoCard = ({ title, iconSrc, value }: Props) => {
  return (
    <div className="price-info_card">
      <p className="text-base text-black-100">{title}</p>

      <div className="flex items-center gap-2">
        <Image src={iconSrc} alt={title || "Price info"} width={24} height={24} />
        <p className="text-2xl font-bold text-secondary">{value}</p>
      </div>
    </div>
  );
};

export default PriceInfoCard;
