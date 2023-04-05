import { render, screen } from '@testing-library/react';
import { Moon } from './Moon/Moon';
import { CurvedArrow } from './CurvedArrow/CurvedArrow';
import { Placeholder } from './Placeholder/Placeholder';
import { ConnectTable } from './ConnectTable/ConnectTable';
import { Link } from './Link/Link';
import { File } from './File/File';
import { Brush } from './Brush/Brush';
import { Folder } from './Folder/Folder';
import { Settings } from './Settings/Settings';
import { Highlight } from './Highlight/Highlight';
import { CircularArrow } from './CircularArrow/CircularArrow';
import { Deci } from './Deci/Deci';
import { Percentage } from './Percentage/Percentage';
import { ImportRangeCopies } from './ImportRangeCopies/ImportRangeCopies';
import { List } from './List/List';
import { Discord } from './Discord/Discord';
import { Blockquote } from './Blockquote/Blockquote';
import { Chat } from './Chat/Chat';
import { AnnotationWarning } from './AnnotationWarning/AnnotationWarning';
import { Compass } from './Compass/Compass';
import { Beach } from './Beach/Beach';
import { Clock } from './Clock/Clock';
import { Strikethrough } from './Strikethrough/Strikethrough';
import { Message } from './Message/Message';
import { Warning } from './Warning/Warning';
import { Formula } from './Formula/Formula';
import { Delete } from './Delete/Delete';
import { Actions } from './Actions/Actions';
import { DollarCircle } from './DollarCircle/DollarCircle';
import { Loading } from './Loading/Loading';
import { Input } from './Input/Input';
import { Shapes } from './Shapes/Shapes';
import { LightBulb } from './LightBulb/LightBulb';
import { Calendar } from './Calendar/Calendar';
import { Caret } from './Caret/Caret';
import { Announcement } from './Announcement/Announcement';
import { TV } from './TV/TV';
import { Bolt } from './Bolt/Bolt';
import { Create } from './Create/Create';
import { Slash } from './Slash/Slash';
import { Plane } from './Plane/Plane';
import { Bold } from './Bold/Bold';
import { Chart } from './Chart/Chart';
import { DatePicker } from './DatePicker/DatePicker';
import { Close } from './Close/Close';
import { Disk } from './Disk/Disk';
import { All } from './All/All';
import { Heading } from './Heading/Heading';
import { Cards } from './Cards/Cards';
import { Medal } from './Medal/Medal';
import { LeftArrow } from './LeftArrow/LeftArrow';
import { TinyArrow } from './TinyArrow/TinyArrow';
import { Docs } from './Docs/Docs';
import { CheckboxUnselected } from './CheckboxUnselected/CheckboxUnselected';
import { NestIndicator } from './NestIndicator/NestIndicator';
import { People } from './People/People';
import { Underline } from './Underline/Underline';
import { Pie } from './Pie/Pie';
import { Show } from './Show/Show';
import { CodeBlock } from './CodeBlock/CodeBlock';
import { BooleanCheckboxUnselected } from './BooleanCheckboxUnselected/BooleanCheckboxUnselected';
import { BuildingStore } from './BuildingStore/BuildingStore';
import { ArrowOutlined } from './ArrowOutlined/ArrowOutlined';
import { Result } from './Result/Result';
import { Movie } from './Movie/Movie';
import { Heart } from './Heart/Heart';
import { Italic } from './Italic/Italic';
import { Sunrise } from './Sunrise/Sunrise';
import { Happy } from './Happy/Happy';
import { Check } from './Check/Check';
import { Dropdown } from './Dropdown/Dropdown';
import { Server } from './Server/Server';
import { Leaf } from './Leaf/Leaf';
import { Package } from './Package/Package';
import { Minus } from './Minus/Minus';
import { Calculations } from './Calculations/Calculations';
import { Coffee } from './Coffee/Coffee';
import { Chevron } from './Chevron/Chevron';
import { Heading2 } from './Heading2/Heading2';
import { Star } from './Star/Star';
import { Truck } from './Truck/Truck';
import { Cloud } from './Cloud/Cloud';
import { Slider } from './Slider/Slider';
import { Music } from './Music/Music';
import { Bell } from './Bell/Bell';
import { Frame } from './Frame/Frame';
import { Success } from './Success/Success';
import { Sparkles } from './Sparkles/Sparkles';
import { Rocket } from './Rocket/Rocket';
import { FolderOpen } from './FolderOpen/FolderOpen';
import { Car } from './Car/Car';
import { Logout } from './Logout/Logout';
import { Hide } from './Hide/Hide';
import { Add } from './Add/Add';
import { Key } from './Key/Key';
import { Spider } from './Spider/Spider';
import { Battery } from './Battery/Battery';
import { Bullet } from './Bullet/Bullet';
import { Divider } from './Divider/Divider';
import { Info } from './Info/Info';
import { Education } from './Education/Education';
import { Paperclip } from './Paperclip/Paperclip';
import { Text } from './Text/Text';
import { Bank } from './Bank/Bank';
import { Table } from './Table/Table';
import { Generic } from './Generic/Generic';
import { CheckboxSelected } from './CheckboxSelected/CheckboxSelected';
import { Quote } from './Quote/Quote';
import { Globe } from './Globe/Globe';
import { Wallet } from './Wallet/Wallet';
import { Callout } from './Callout/Callout';
import { Trash } from './Trash/Trash';
import { Zap } from './Zap/Zap';
import { Pin } from './Pin/Pin';
import { Virus } from './Virus/Virus';
import { Crown } from './Crown/Crown';
import { Heading1 } from './Heading1/Heading1';
import { TableSlash } from './TableSlash/TableSlash';
import { DragHandle } from './DragHandle/DragHandle';
import { Trophy } from './Trophy/Trophy';
import { Card } from './Card/Card';
import { Ellipsis } from './Ellipsis/Ellipsis';
import { World } from './World/World';
import { Refresh } from './Refresh/Refresh';
import { Plot } from './Plot/Plot';
import { ImportTable } from './ImportTable/ImportTable';
import { ShoppingCart } from './ShoppingCart/ShoppingCart';
import { BooleanCheckboxSelected } from './BooleanCheckboxSelected/BooleanCheckboxSelected';
import { Number } from './Number/Number';
import { Health } from './Health/Health';
import { Sketch } from './Sketch/Sketch';
import { Code } from './Code/Code';
import { ConnectRanges } from './ConnectRanges/ConnectRanges';

it('renders a moon icon', () => {
  render(<Moon />);
  expect(screen.getByTitle(/moon/i)).toBeInTheDocument();
});

it('renders a curved arrow', () => {
  const { getByTitle } = render(
    <CurvedArrow title="Curved Arrow" direction="left" active={true} />
  );
  expect(getByTitle(/curved arrow/i)).toBeInTheDocument();
});

it('renders a placeholder icon', () => {
  render(<Placeholder />);
  expect(screen.getByTitle(/placeholder/i)).toBeInTheDocument();
});

it('renders a ConnectTable icon', () => {
  render(<ConnectTable />);
  expect(screen.getByTitle(/table/i)).toBeInTheDocument();
});

it('renders a link icon', () => {
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  render(<Link />);
  expect(screen.getByTitle(/link/i)).toBeInTheDocument();
});

it('renders a file icon', () => {
  render(<File />);
  expect(screen.getByTitle(/file/i)).toBeInTheDocument();
});

it('renders a brush icon', () => {
  render(<Brush />);
  expect(screen.getByTitle(/Brush/i)).toBeInTheDocument();
});

it('renders a folder icon', () => {
  render(<Folder />);
  expect(screen.getByTitle(/folder/i)).toBeInTheDocument();
});

it('renders a settings icon', () => {
  render(<Settings />);
  expect(screen.getByTitle(/settings/i)).toBeInTheDocument();
});

it('renders a highlight icon', () => {
  render(<Highlight />);
  expect(screen.getByTitle(/highlight/i)).toBeInTheDocument();
});

it('renders a circular arrow icon', () => {
  render(<CircularArrow />);
  expect(screen.getByTitle(/circular arrow/i)).toBeInTheDocument();
});

it('renders a deci icon', () => {
  render(<Deci />);
  expect(screen.getByTitle(/decipad logo/i)).toBeInTheDocument();
});

it('renders a percentage icon', () => {
  render(<Percentage />);
  expect(screen.getByTitle(/percentage/i)).toBeInTheDocument();
});

it('renders a ImportRangeCopies icon', () => {
  render(<ImportRangeCopies />);
  expect(screen.getByTitle(/range/i)).toBeInTheDocument();
});

it('renders a list icon', () => {
  render(<List />);
  expect(screen.getByTitle(/List/i)).toBeInTheDocument();
});

it('renders a discord icon', () => {
  render(<Discord />);
  expect(screen.getByTitle(/discord/i)).toBeInTheDocument();
});

it('renders a Blockquote icon', () => {
  render(<Blockquote />);
  expect(screen.getByTitle(/blockquote/i)).toBeInTheDocument();
});

it('renders a chat icon', () => {
  render(<Chat />);
  expect(screen.getByTitle(/chat/i)).toBeInTheDocument();
});

it('renders an annotation warning icon', () => {
  render(<AnnotationWarning />);
  expect(screen.getByTitle(/annotation warning/i)).toBeInTheDocument();
});

it('renders a compass icon', () => {
  render(<Compass />);
  expect(screen.getByTitle(/compass/i)).toBeInTheDocument();
});

it('renders a beach icon', () => {
  render(<Beach />);
  expect(screen.getByTitle(/beach/i)).toBeInTheDocument();
});

it('renders a clock icon', () => {
  render(<Clock />);
  expect(screen.getByTitle(/clock/i)).toBeInTheDocument();
});

it('renders a strikethrough icon', () => {
  render(<Strikethrough />);
  expect(screen.getByTitle(/strikethrough/i)).toBeInTheDocument();
});

it('renders a message icon', () => {
  render(<Message />);
  expect(screen.getByTitle(/message/i)).toBeInTheDocument();
});

it('renders a warning icon', () => {
  render(<Warning />);
  expect(screen.getByTitle(/warning/i)).toBeInTheDocument();
});

it('renders a formula icon', () => {
  render(<Formula />);
  expect(screen.getByTitle(/formula/i)).toBeInTheDocument();
});

it('renders a delete icon', () => {
  render(<Delete />);
  expect(screen.getByTitle(/delete/i)).toBeInTheDocument();
});

it('renders a actions icon', () => {
  render(<Actions />);
  expect(screen.getByTitle(/actions/i)).toBeInTheDocument();
});

it('renders a dollar circle icon', () => {
  render(<DollarCircle />);
  expect(screen.getByTitle(/dollar circle/i)).toBeInTheDocument();
});

it('renders a loading icon', () => {
  render(<Loading />);
  expect(screen.getByTitle(/loading/i)).toBeInTheDocument();
});

it('renders a input icon', () => {
  render(<Input />);
  expect(screen.getByTitle(/input/i)).toBeInTheDocument();
});

it('renders a shapes icon', () => {
  render(<Shapes />);
  expect(screen.getByTitle(/shapes/i)).toBeInTheDocument();
});

it('renders a lightbulb icon', () => {
  render(<LightBulb />);
  expect(screen.getByTitle(/lightbulb/i)).toBeInTheDocument();
});

it('renders a calendar icon', () => {
  render(<Calendar />);
  expect(screen.getByTitle(/calendar/i)).toBeInTheDocument();
});

it.each(['down', 'right', 'up'] as const)(
  'renders a caret %s icon',
  (variant) => {
    render(<Caret variant={variant} />);
    expect(screen.getByTitle(new RegExp(variant, 'i'))).toBeInTheDocument();
  }
);

it('renders an "announcement" icon', () => {
  render(<Announcement />);
  expect(screen.getByTitle(/announcement/i)).toBeInTheDocument();
});

it('renders a tv icon', () => {
  render(<TV />);
  expect(screen.getByTitle(/tv/i)).toBeInTheDocument();
});

it('renders a bolt icon', () => {
  render(<Bolt />);
  expect(screen.getByTitle(/bolt/i)).toBeInTheDocument();
});

it('renders a create icon', () => {
  render(<Create />);
  expect(screen.getByTitle(/create/i)).toBeInTheDocument();
});

it('renders a slash icon', () => {
  render(<Slash />);
  expect(screen.getByTitle(/slash/i)).toBeInTheDocument();
});

it('renders a plane icon', () => {
  render(<Plane />);
  expect(screen.getByTitle(/plane/i)).toBeInTheDocument();
});

it('renders a bold icon', () => {
  render(<Bold />);
  expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
});

it('renders a chart icon', () => {
  render(<Chart />);
  expect(screen.getByTitle(/chart/i)).toBeInTheDocument();
});

it('renders a datepicker icon', () => {
  render(<DatePicker />);
  expect(screen.getByTitle(/datepicker/i)).toBeInTheDocument();
});

it('renders a close icon', () => {
  render(<Close />);
  expect(screen.getByTitle(/close/i)).toBeInTheDocument();
});

it('renders a disk icon', () => {
  render(<Disk />);
  expect(screen.getByTitle(/disk/i)).toBeInTheDocument();
});

it('renders an "all" icon', () => {
  render(<All />);
  expect(screen.getByTitle(/all/i)).toBeInTheDocument();
});

it('renders a heading icon', () => {
  render(<Heading />);
  expect(screen.getByTitle(/heading/i)).toBeInTheDocument();
});

it('renders the cards icon', () => {
  render(<Cards />);
  expect(screen.getByTitle(/cards/i)).toBeInTheDocument();
});

it('renders a medal icon', () => {
  render(<Medal />);
  expect(screen.getByTitle(/medal/i)).toBeInTheDocument();
});

it('renders a left arrow icon', () => {
  render(<LeftArrow />);
  expect(screen.getByTitle(/left arrow/i)).toBeInTheDocument();
});

it.each(['right', 'down'] as const)(
  'renders an arrow in direction %s',
  (direction) => {
    render(<TinyArrow direction={direction} />);
    expect(screen.getByTitle(new RegExp(direction, 'i'))).toBeInTheDocument();
  }
);

it('renders a docs icon', () => {
  render(<Docs />);
  expect(screen.getByTitle(/docs/i)).toBeInTheDocument();
});

it('renders a checkbox unselected icon', () => {
  render(<CheckboxUnselected />);
  expect(screen.getByTitle(/unselected/i)).toBeInTheDocument();
});

it('renders a nest indicator icon', () => {
  render(<NestIndicator />);
  expect(screen.getByTitle(/nest/i)).toBeInTheDocument();
});

it('renders a people icon', () => {
  render(<People />);
  expect(screen.getByTitle(/people/i)).toBeInTheDocument();
});

it('renders a underline icon', () => {
  render(<Underline />);
  expect(screen.getByTitle(/underline/i)).toBeInTheDocument();
});

it('renders a pie icon', () => {
  render(<Pie />);
  expect(screen.getByTitle(/pie/i)).toBeInTheDocument();
});

it('renders a show icon', () => {
  render(<Show />);
  expect(screen.getByTitle(/show/i)).toBeInTheDocument();
});

it('renders a codeblock icon', () => {
  render(<CodeBlock />);
  expect(screen.getByTitle(/code/i)).toBeInTheDocument();
});

it('renders a boolean checkbox unselected icon', () => {
  render(<BooleanCheckboxUnselected />);
  expect(screen.getByTitle(/unselected/i)).toBeInTheDocument();
});

it('renders a building store icon', () => {
  render(<BuildingStore />);
  expect(screen.getByTitle(/building store/i)).toBeInTheDocument();
});

it('renders an outlined arrow icon', () => {
  render(<ArrowOutlined />);
  expect(screen.getByTitle(/arrowoutlined/i)).toBeInTheDocument();
});

it('renders a result icon', () => {
  render(<Result />);
  expect(screen.getByTitle(/result/i)).toBeInTheDocument();
});

it('renders a movie icon', () => {
  render(<Movie />);
  expect(screen.getByTitle(/movie/i)).toBeInTheDocument();
});

it('renders a heart icon', () => {
  render(<Heart />);
  expect(screen.getByTitle(/heart/i)).toBeInTheDocument();
});

it('renders a italic icon', () => {
  render(<Italic />);
  expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
});

it('renders a sunrise icon', () => {
  render(<Sunrise />);
  expect(screen.getByTitle(/sunrise/i)).toBeInTheDocument();
});

it('renders a happy icon', () => {
  render(<Happy />);
  expect(screen.getByTitle(/happy/i)).toBeInTheDocument();
});

it('renders a check icon', () => {
  render(<Check />);
  expect(screen.getByTitle(/check/i)).toBeInTheDocument();
});

it('renders a dropdown icon', () => {
  render(<Dropdown />);
  expect(screen.getByTitle(/dropdown/i)).toBeInTheDocument();
});

it('renders a server icon', () => {
  render(<Server />);
  expect(screen.getByTitle(/server/i)).toBeInTheDocument();
});

it('renders a leaf icon', () => {
  render(<Leaf />);
  expect(screen.getByTitle(/leaf/i)).toBeInTheDocument();
});

it('renders a package icon', () => {
  render(<Package />);
  expect(screen.getByTitle(/package/i)).toBeInTheDocument();
});

it('renders a minus icon', () => {
  render(<Minus />);
  expect(screen.getByTitle(/minus/i)).toBeInTheDocument();
});

it('renders a calculations icon', () => {
  render(<Calculations />);
  expect(screen.getByTitle(/slashcommandcal/i)).toBeInTheDocument();
});

it('renders a coffee icon', () => {
  render(<Coffee />);
  expect(screen.getByTitle(/coffee/i)).toBeInTheDocument();
});

it.each(['expand', 'collapse'] as const)(
  'renders a caret of type %s',
  (type) => {
    render(<Chevron type={type} />);
    expect(screen.getByTitle(new RegExp(type, 'i'))).toBeInTheDocument();
  }
);

it('renders a h2 icon', () => {
  render(<Heading2 />);
  expect(screen.getByTitle(/heading2/i)).toBeInTheDocument();
});

it('renders a star icon', () => {
  render(<Star />);
  expect(screen.getByTitle(/star/i)).toBeInTheDocument();
});

it('renders a truck icon', () => {
  render(<Truck />);
  expect(screen.getByTitle(/truck/i)).toBeInTheDocument();
});

it('renders a cloud icon', () => {
  render(<Cloud />);
  expect(screen.getByTitle(/cloud/i)).toBeInTheDocument();
});

it('renders a slider icon', () => {
  render(<Slider />);
  expect(screen.getByTitle(/slider/i)).toBeInTheDocument();
});

it('renders a music icon', () => {
  render(<Music />);
  expect(screen.getByTitle(/music/i)).toBeInTheDocument();
});

it('renders a bell icon', () => {
  render(<Bell />);
  expect(screen.getByTitle(/bell/i)).toBeInTheDocument();
});

it('renders a frame icon', () => {
  render(<Frame />);
  expect(screen.getByTitle(/frame/i)).toBeInTheDocument();
});

it('renders a success icon', () => {
  render(<Success />);
  expect(screen.getByTitle(/success/i)).toBeInTheDocument();
});

it('renders a sparkles icon', () => {
  render(<Sparkles />);
  expect(screen.getByTitle(/sparkles/i)).toBeInTheDocument();
});

it('renders a rocket icon', () => {
  render(<Rocket />);
  expect(screen.getByTitle(/rocket/i)).toBeInTheDocument();
});

it('renders a folder open icon', () => {
  render(<FolderOpen />);
  expect(screen.getByTitle(/folder open/i)).toBeInTheDocument();
});

it('renders a car icon', () => {
  render(<Car />);
  expect(screen.getByTitle(/car/i)).toBeInTheDocument();
});

it('renders a logout icon', () => {
  render(<Logout />);
  expect(screen.getByTitle(/log.*out/i)).toBeInTheDocument();
});

it('renders a hide icon', () => {
  render(<Hide />);
  expect(screen.getByTitle(/hide/i)).toBeInTheDocument();
});

it('renders an "add" icon', () => {
  render(<Add />);
  expect(screen.getByTitle(/add/i)).toBeInTheDocument();
});

it('renders a key icon', () => {
  render(<Key />);
  expect(screen.getByTitle(/key/i)).toBeInTheDocument();
});

it('renders a spider icon', () => {
  render(<Spider />);
  expect(screen.getByTitle(/spider/i)).toBeInTheDocument();
});

it('renders a battery icon', () => {
  render(<Battery />);
  expect(screen.getByTitle(/battery/i)).toBeInTheDocument();
});

it('renders a bullet icon', () => {
  render(<Bullet />);
  expect(screen.getByTitle(/bullet/i)).toBeInTheDocument();
});

it('cycles through different icons at different depths', () => {
  const d1InnerHTML = render(<Bullet depth={1} />).container.innerHTML;

  let depthRepeatingFirst;
  // I'm usually in favor of readable over concise code, but this is an art exhibition now
  for (
    depthRepeatingFirst = 2;
    render(<Bullet depth={depthRepeatingFirst} />).container.innerHTML !==
    d1InnerHTML;
    depthRepeatingFirst += 1
  );

  expect(depthRepeatingFirst).toBe(4);
});

it('renders a divider icon', () => {
  render(<Divider />);
  expect(screen.getByTitle(/divider/i)).toBeInTheDocument();
});

it('renders an info icon', () => {
  render(<Info />);
  expect(screen.getByTitle(/info/i)).toBeInTheDocument();
});

it('renders a education icon', () => {
  render(<Education />);
  expect(screen.getByTitle(/education/i)).toBeInTheDocument();
});

it('renders a paperlip icon', () => {
  render(<Paperclip />);
  expect(screen.getByTitle(/paperclip/i)).toBeInTheDocument();
});

it('renders a text icon', () => {
  render(<Text />);
  expect(screen.getByTitle(/text/i)).toBeInTheDocument();
});

it('renders a bank icon', () => {
  render(<Bank />);
  expect(screen.getByTitle(/bank/i)).toBeInTheDocument();
});

it('renders a table icon', () => {
  render(<Table />);
  expect(screen.getByTitle(/table/i)).toBeInTheDocument();
});

it('renders a generic icon', () => {
  render(<Generic />);
  expect(screen.getByTitle(/generic/i)).toBeInTheDocument();
});

it('renders a checkbox selected icon', () => {
  render(<CheckboxSelected />);
  expect(screen.getByTitle(/selected/i)).toBeInTheDocument();
});

it('renders a quote icon', () => {
  render(<Quote />);
  expect(screen.getByTitle(/quote/i)).toBeInTheDocument();
});

it('renders a globe icon', () => {
  render(<Globe />);
  expect(screen.getByTitle(/glob/i)).toBeInTheDocument();
});

it('renders a wallet icon', () => {
  render(<Wallet />);
  expect(screen.getByTitle(/wallet/i)).toBeInTheDocument();
});

it('renders a callout icon', () => {
  render(<Callout />);
  expect(screen.getByTitle(/callout/i)).toBeInTheDocument();
});

it('renders a trash icon', () => {
  render(<Trash />);
  expect(screen.getByTitle(/trash/i)).toBeInTheDocument();
});

it('renders a zap icon', () => {
  render(<Zap />);
  expect(screen.getByTitle(/zap/i)).toBeInTheDocument();
});

it('renders a pin icon', () => {
  render(<Pin />);
  expect(screen.getByTitle(/pin/i)).toBeInTheDocument();
});

it('renders a virus icon', () => {
  render(<Virus />);
  expect(screen.getByTitle(/virus/i)).toBeInTheDocument();
});

it('renders a crown icon', () => {
  render(<Crown />);
  expect(screen.getByTitle(/crown/i)).toBeInTheDocument();
});

it('renders a h1 icon', () => {
  render(<Heading1 />);
  expect(screen.getByTitle(/heading1/i)).toBeInTheDocument();
});

it('renders a table icon for slash commands', () => {
  render(<TableSlash />);
  expect(screen.getByTitle(/tableslash/i)).toBeInTheDocument();
});

it('renders a drag handle', () => {
  render(<DragHandle />);
  expect(screen.getByTitle(/drag/i)).toBeInTheDocument();
});

it('renders a trophy icon', () => {
  render(<Trophy />);
  expect(screen.getByTitle(/trophy/i)).toBeInTheDocument();
});

it('renders a card icon', () => {
  render(<Card />);
  expect(screen.getByTitle(/card/i)).toBeInTheDocument();
});

it('renders a ellipsis icon', () => {
  render(<Ellipsis />);
  expect(screen.getByTitle(/ellipsis/i)).toBeInTheDocument();
});

it('renders a world icon', () => {
  render(<World />);
  expect(screen.getByTitle(/world/i)).toBeInTheDocument();
});

it('renders a refresh icon', () => {
  render(<Refresh />);
  expect(screen.getByTitle(/refresh/i)).toBeInTheDocument();
});

it('renders a plot icon', () => {
  render(<Plot />);
  expect(screen.getByTitle(/plot/i)).toBeInTheDocument();
});

it('renders a ImportTable icon', () => {
  render(<ImportTable />);
  expect(screen.getByTitle(/table/i)).toBeInTheDocument();
});

it('renders a shopping cart icon', () => {
  render(<ShoppingCart />);
  expect(screen.getByTitle(/shopping cart/i)).toBeInTheDocument();
});

it('renders a boolean checkbox selected icon', () => {
  render(<BooleanCheckboxSelected />);
  expect(screen.getByTitle(/selected/i)).toBeInTheDocument();
});

it('renders a number icon', () => {
  render(<Number />);
  expect(screen.getByTitle(/number/i)).toBeInTheDocument();
});

it('renders a health icon', () => {
  render(<Health />);
  expect(screen.getByTitle(/health/i)).toBeInTheDocument();
});

it('renders a sketch icon', () => {
  render(<Sketch />);
  expect(screen.getByTitle(/sketch/i)).toBeInTheDocument();
});

it('renders a code icon', () => {
  render(<Code />);
  expect(screen.getByTitle(/code/i)).toBeInTheDocument();
});

it('renders a ConnectRanges icon', () => {
  render(<ConnectRanges />);
  expect(screen.getByTitle(/ranges/i)).toBeInTheDocument();
});
