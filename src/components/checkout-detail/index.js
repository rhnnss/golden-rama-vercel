import {
  Box,
  Circle,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Radio,
  Stack,
  Text,
  VStack,
  useDisclosure,
  useBreakpointValue,
  Heading,
  Button,
  Spinner,
  Badge,
  Switch,
  Divider,
  keyframes,
} from "@chakra-ui/react";
import { Field, Form, Formik, useFormikContext } from "formik";
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { CustomFilterButton, CustomOrangeFullWidthButton } from "../button";
import GlobalForm from "../person";
import countries from "../../mocks/countries.json";
import {
  convertDateWithMonthName,
  convertRupiah,
  travelerType,
} from "../../helpers";
import { CustomDivider } from "../divider";
import {
  FlightPriceDetails,
  InsuranceProtectionsList,
  NoResults,
} from "../card";
import {
  getAllPromoList,
  getPromoListTour,
  postPromoUniqueCode,
  getPromoPayment,
} from "../../services/promo.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Yup from "yup";
import date from "../../helpers/date";
import { Step, Steps } from "chakra-ui-steps";
import { useSelector } from "react-redux";
import { addYears, differenceInYears } from "date-fns";
import { uploadFile } from "../../services/file.service";
import _ from "underscore";
import axios from "axios";
const CheckoutDetail = ({
  steps,
  totalDownPayment,
  detail_prices,
  additionals,
  people,
  customer,
  customFields,
  customForm,
  customValidation,
  handleChange,
  handleTraveler,
  handlePromo = null,
  isPromoAvailable = false,
  isDomestic,
  isInsurance = false,
  isKTP = false,
  category,
  isSpesificPromo,
  isLackField,
  ...props
}) => {
  const isDesktop = useBreakpointValue(
    { base: true, md: false },
    { ssr: false }
  );
  const router = useRouter();
  const { isLoggedIn, user } = useSelector((s) => s.authReducer);
  const users = {
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
  };
  const { nextStep, prevStep, setStep, reset, activeStep } = steps;
  const sections = [
    [
      {
        title: "Promo",
        content: (
          <Stack>
            <Divider variant={"dashed"} />
            {/* <Text
              fontSize={{ base: "sm", md: "md" }}
              color="neutral.text.low"
              pt="16px"
            >
              Kode Promo
            </Text> */}
            {handlePromo ? (
              <DrawerPromo
                handlePromo={handlePromo}
                category={category}
                isSpesificPromo={isSpesificPromo}
              />
            ) : null}
            {isPromoAvailable && isPromoAvailable.available ? (
              <Text fontSize={{ base: "sm", md: "md" }} color="green">
                Anda mendapatkan diskon IDR{" "}
                {convertRupiah(isPromoAvailable.totalDiscount)}
              </Text>
            ) : isPromoAvailable &&
              isPromoAvailable?.error?.message ==
                "Promo code is already used" ? (
              <Text fontSize={{ base: "sm", md: "md" }} color="alert.failed">
                Promo tidak dapat kamu gunakan lagi
              </Text>
            ) : isPromoAvailable &&
              isPromoAvailable?.error?.message ==
                "This promo is only for specified product" ? (
              <Text fontSize={{ base: "sm", md: "md" }} color="alert.failed">
                Promo hanya untuk produk tertentu
              </Text>
            ) : isPromoAvailable &&
              isPromoAvailable?.error?.message == "promo code expired" ? (
              <Text fontSize={{ base: "sm", md: "md" }} color="alert.failed">
                Promo sudah kadaluarsa
              </Text>
            ) : isPromoAvailable &&
              isPromoAvailable?.error?.message == "Promo code is over" ? (
              <Text fontSize={{ base: "sm", md: "md" }} color="alert.failed">
                Promo sudah habis digunakan
              </Text>
            ) : isPromoAvailable &&
              isPromoAvailable?.error?.message ==
                "Total transaction lower than minimum transaction" ? (
              <Text fontSize={{ base: "sm", md: "md" }} color="alert.failed">
                Total transaksi anda masih belum mencukupi untuk menggunakan
                promo ini
              </Text>
            ) : (
              isPromoAvailable &&
              isPromoAvailable.available == false && (
                <Text fontSize={{ base: "sm", md: "md" }} color="alert.failed">
                  Promo tidak bisa digunakan
                </Text>
              )
            )}
            {/* <HStack justifyContent="space-between" py={2}>
              <Text fontWeight="semibold">Lihat Promo Tersedia</Text>
              <Image
                src="/svg/icons/chevron-left-dark.svg"
                alt="chevron"
                width={16}
                height={16}
              />
            </HStack> */}
          </Stack>
        ),
        hidden: !handlePromo,
      },
      ...(router.pathname.startsWith("/insurances")
        ? [
            // {
            //   title: "Tambahan Pesan",
            //   content: (
            //     <>
            //       <FormControl>
            //         <FormLabel fontSize={"sm"}>
            //           Tujuan Lain (Jika Tersedia)
            //         </FormLabel>
            //         {/* <Input variant="filled" name="" type={"text"} /> */}
            //       </FormControl>
            //       {/* <FormControl>
            //         <FormLabel fontSize={"sm"}>
            //           Beri Nama Perjalan Ini
            //         </FormLabel>
            //         <Input variant="filled" {...field} type={"text"} />
            //       </FormControl> */}
            //     </>
            //   ),
            // },
            {
              title: "Pilih Perlindungan",
              content: (
                <InsuranceProtectionsList detail_prices={detail_prices} />
              ),
            },
          ]
        : []),
      {
        title: "Rincian Biaya",
        notes: "Harga dalam Rupiah",
        content: (
          <Box py={"12px"}>
            <Divider variant={"dashed"} />
            {detail_prices &&
            !detail_prices.isLoading &&
            router.pathname.startsWith("/flights") ? (
              <FlightPriceDetails
                detail_prices={detail_prices}
                // hidden={!isDesktop}
                isPromoAvailable={isPromoAvailable}
              />
            ) : router.pathname.startsWith("/tours") ||
              router.pathname.startsWith("/cruises") ||
              router.pathname.startsWith("/packages") ? (
              <Stack mb={"-24px"} mx={"-24px"} px={"24px"} pt={"16px"}>
                {detail_prices.map((item, parentIndex) => (
                  <>
                    {parentIndex < 2 &&
                      item.map((i, index) => (
                        <>
                          {!i.h && (
                            <HStack
                              // px={"24px"}
                              key={index}
                              w="full"
                              justifyContent="space-between"
                            >
                              <Text
                                fontSize={{ base: "sm", md: "md" }}
                                color={
                                  parentIndex === 0
                                    ? "neutral.text.medium"
                                    : "neutral.text.high"
                                }
                                fontWeight={i.b && "semibold"}
                              >
                                {i.t}
                              </Text>
                              <Text
                                fontSize={{ base: "sm", md: "md" }}
                                color={
                                  i.g
                                    ? "green.400"
                                    : parentIndex === 0
                                    ? "neutral.text.medium"
                                    : "neutral.text.high"
                                }
                                fontWeight={i.b && "semibold"}
                              >
                                {i.p}
                              </Text>
                            </HStack>
                          )}
                        </>
                      ))}
                    <Divider
                      hidden={parentIndex > 0}
                      variant={"dashed"}
                      // borderColor={"red"}
                    />
                  </>
                ))}
              </Stack>
            ) : router.pathname.startsWith("/attractions") ? (
              <Stack mb={"-24px"} mx={"-24px"} px={"24px"} pt={"16px"}></Stack>
            ) : router.pathname.startsWith("/insurances") ? (
              <Box py={"12px"}>
                {/* <Divider variant={"dashed"} /> */}
                <Stack mb={"-24px"} mx={"-24px"} px={"24px"} pt={"16px"}>
                  {detail_prices.map((item, parentIndex) => (
                    <>
                      {parentIndex < 2 &&
                        item.map((i, index) => (
                          <>
                            {!i.h && (
                              <HStack
                                // px={"24px"}
                                key={index}
                                w="full"
                                justifyContent="space-between"
                              >
                                <Text
                                  fontSize={{ base: "sm", md: "md" }}
                                  color={
                                    parentIndex === 0
                                      ? "neutral.text.medium"
                                      : "neutral.text.high"
                                  }
                                  fontWeight={i.b && "semibold"}
                                >
                                  {i.t}
                                </Text>
                                <Text
                                  fontSize={{ base: "sm", md: "md" }}
                                  color={
                                    i.g
                                      ? "green.400"
                                      : parentIndex === 0
                                      ? "neutral.text.medium"
                                      : "neutral.text.high"
                                  }
                                  fontWeight={i.b && "semibold"}
                                >
                                  {i.p}
                                </Text>
                              </HStack>
                            )}
                          </>
                        ))}
                      <Divider
                        hidden={parentIndex > 0}
                        variant={"dashed"}
                        // borderColor={"red"}
                      />
                    </>
                  ))}
                </Stack>
              </Box>
            ) : (
              <NoResults href="/" />
            )}
          </Box>
        ),
        hidden: !isDesktop && router.pathname.startsWith("/flights"),
      },
      ...(router.pathname.startsWith("/tours")
        ? [
            {
              title: "Rincian Deposit",
              content: (
                <Box py={"12px"}>
                  <Divider variant={"dashed"} />
                  {!detail_prices.isLoading &&
                  router.pathname.startsWith("/tours") ? (
                    <Stack mb={"-24px"} mx={"-24px"} px={"24px"} pt={"16px"}>
                      {detail_prices.map((item, parentIndex) => (
                        <>
                          {parentIndex > 1 &&
                            item.map((i, index) => (
                              <>
                                {!i.h && (
                                  <HStack
                                    // px={"24px"}
                                    key={index}
                                    w="full"
                                    justifyContent="space-between"
                                  >
                                    <Text
                                      fontSize={{
                                        base: `${
                                          parentIndex === 3 && index == 1
                                            ? "xs"
                                            : "sm"
                                        }`,
                                        md: "md",
                                      }}
                                      color={
                                        parentIndex === 3
                                          ? "neutral.text.medium"
                                          : "neutral.text.high"
                                      }
                                      fontWeight={i.b && "semibold"}
                                    >
                                      {i.t}
                                    </Text>
                                    <Text
                                      fontSize={{ base: "sm", md: "md" }}
                                      color={
                                        i.g
                                          ? "green.400"
                                          : parentIndex === 3
                                          ? "neutral.text.medium"
                                          : "neutral.text.high"
                                      }
                                      fontWeight={i.b && "semibold"}
                                    >
                                      {i.p}
                                    </Text>
                                  </HStack>
                                )}
                              </>
                            ))}
                          <Divider
                            hidden={parentIndex != 2}
                            variant={"dashed"}
                            // borderColor={"red"}
                          />
                        </>
                      ))}
                    </Stack>
                  ) : (
                    <NoResults href="/" />
                  )}
                </Box>
              ),
            },
          ]
        : ""),

      // additionals && {
      //   title: "Tambahan Permintaan",
      //   content: (
      //     <Stack spacing={2} py={"24px"}>
      //       <Divider variant={"dashed"} />
      //       {additionals.map((item, index) => (
      //         <Checkbox key={index} colorScheme="brand.blue" w="full">
      //           <HStack justifyContent="space-between">
      //             <Text
      //               fontSize={{ base: "sm", md: "md" }}
      //               color="neutral.text.medium"
      //             >
      //               {item.t}
      //             </Text>
      //             <Text
      //               fontSize={{ base: "sm", md: "md" }}
      //               color="neutral.text.medium"
      //             >
      //               {item.p}
      //             </Text>
      //           </HStack>
      //         </Checkbox>
      //       ))}
      //       <Divider variant={"dashed"} />
      //     </Stack>
      //   ),
      // },
    ],
    [
      {
        title: "Informasi Kontak",
        content: <ContactInfo handleChange={handleChange} />,
      },
      ...(router.pathname.startsWith("/attractions") &&
      props.dynamicForm.length !== 0
        ? [
            {
              title: "Informasi Lainnya",
              content: <>{props.dynamicFormik}</>,
            },
          ]
        : []),
      {
        ...(people.length !== 0 && {
          title: router.pathname.startsWith("/tours")
            ? "Detail Traveler"
            : router.pathname.startsWith("/flights")
            ? "Detail Penumpang"
            : "Data Pengunjung",
          content: (
            <Box>
              <Divider variant={"dashed"} />
              <FormControl
                hidden={
                  router.pathname.startsWith("/attractions") ||
                  router.pathname.startsWith("/insurances")
                }
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={4}
              >
                <FormLabel
                  htmlFor="same-data"
                  fontSize={{ base: "sm", md: "md" }}
                  color="neutral.text.medium"
                >
                  Sama dengan data pemesan
                </FormLabel>
                <Switch
                  id="same-data"
                  colorScheme="brand.blue"
                  size="lg"
                  onChange={(e) => {
                    const defaultData = {
                      i: 0,
                      key: 0,
                      paxType: "ADT",
                    };
                    if (e.target.checked) {
                      const [first_name, ...rest] = (
                        isLoggedIn ? user.full_name : customer.fullName
                      ).split(" ");
                      handleTraveler({
                        ...defaultData,
                        title: user.title || "Mrs",
                        dob: user.birthdate || "1990-01-01",
                        first_name,
                        last_name: rest.join(" "),
                        passport_number: isDomestic ? user.id_number : "",
                      });
                    } else {
                      handleTraveler(defaultData);
                    }
                  }}
                />
              </FormControl>
              {people &&
                people.map((person, index) => {
                  const isEmpty = _.some(_.values(person));
                  return (
                    <Stack
                      direction={"row"}
                      justifyContent="space-between"
                      w={"full"}
                      key={index}
                      alignItems="center"
                      py={2}
                    >
                      <VStack alignItems="start">
                        <Text
                          fontSize={{ base: "sm", md: "md" }}
                          color={person ? "inherit" : "red.400"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                        >
                          {router.pathname.startsWith("/attractions")
                            ? isEmpty
                              ? "belum ada"
                              : "sudah terisi"
                            : person.first_name ?? "belum ada"}
                        </Text>
                        <Text
                          fontSize={{ base: "sm", md: "md" }}
                          color="neutral.text.medium"
                        >
                          {router.pathname.startsWith("/attractions")
                            ? "Pengunjung"
                            : router.pathname.startsWith("/insurances")
                            ? people.length > 1
                              ? index === 0
                                ? `Family ${index + 1}`
                                : "Other Person"
                              : "Individual"
                            : `${travelerType(person.paxType)} ${person.i + 1}`}
                        </Text>
                      </VStack>
                      <Box>
                        <FormPerson
                          isInsurance={isInsurance}
                          customFields={customFields}
                          customForm={customForm}
                          customValidation={customValidation}
                          isDomestic={isDomestic}
                          item={person}
                          handleTraveler={handleTraveler}
                          index={index}
                          dynamicForm={props.dynamicPerPaxForm}
                          isAttraction={
                            router.pathname.startsWith("/attractions")
                              ? true
                              : false
                          }
                          isCruises={
                            router.pathname.startsWith("/cruises")
                              ? true
                              : false
                          }
                          title={`${
                            router.pathname.startsWith("/tours")
                              ? "Data Traveler"
                              : router.pathname.startsWith("/insurances")
                              ? "Detail Pemesan"
                              : "Penumpang"
                          }`}
                          isKTP={isKTP}
                          isLackField={isLackField}
                        />
                      </Box>
                    </Stack>
                  );
                })}
            </Box>
          ),
        }),
      },
    ].filter((item) => {
      return !item.hidden;
    }),
  ];

  return (
    <>
      <Steps
        orientation="horizontal"
        responsive={false}
        id={"checkout-detail"}
        activeStep={activeStep}
      >
        {sections.map((parentSection, index) => {
          return (
            <Step key={index}>
              {parentSection
                .filter((item) => {
                  return !item.hidden;
                })
                .map((section, index) => (
                  <Box key={index} as={"section"}>
                    <Box hidden={index === 0}>
                      <Box mx={"24px"}>
                        <CustomDivider hidden={!isDesktop} />
                      </Box>
                      <Divider hidden={isDesktop} />
                    </Box>
                    {/* <Box py={"5px"} bg={"brand.blue.100"} hidden={isDesktop} /> */}
                    <Box
                      pt={index === 0 ? 0 : "24px"}
                      pb={"24px"}
                      px={{ base: "24px", xl: 0 }}
                      bg={"white"}
                    >
                      <HStack w="full" justifyContent="space-between">
                        <Text
                          as={Heading}
                          fontSize={{ base: "lg", md: "md" }}
                          fontWeight="semibold"
                        >
                          {section.title}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }}>
                          {section?.notes}
                        </Text>
                      </HStack>

                      {section.content}
                    </Box>
                  </Box>
                ))}
            </Step>
          );
        })}
      </Steps>
    </>
  );
};

export default CheckoutDetail;

const TNCDrawer = ({ html }) => {
  const drawerRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        color="brand.blue.400"
        w="fit-content"
        px={0}
        fontSize={{ base: "sm", md: "md" }}
        fontWeight="semibold"
        variant="ghost"
        onClick={onOpen}
      >
        Lihat Syarat dan Ketentuan
      </Button>
      <CustomFilterButton
        drawer={drawerRef}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        title={"Syarat dan Ketentuan"}
        hidefooter
        notrounded
      >
        <Box py="16px">
          <Text
            as={"div"}
            fontSize={"sm"}
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        </Box>
      </CustomFilterButton>
    </>
  );
};

export const DrawerPromo = ({
  handlePromo,
  isFromTour = false,
  category,
  isSpesificPromo = false,
  isPayment = false,
  dataTransaction = {},
}) => {
  const drawerRef = useRef();
  const [selected, setSelected] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mutation = useMutation(postPromoUniqueCode, {
    onSuccess: (data) => {},
    onError: (error) => {
      console.log(error);
    },
  });
  const handleSubmit = (values, action) => {
    const { promo } = values;
    return mutation.mutateAsync(values).catch((error) => {
      action.setFieldError("promo", "Promo tidak bisa digunakan");
    });
  };
  const promoHardcode = {
    id: 32,
    attributes: {
      name: "Promo Harbolnas 11.11 Tour",
      limit_per_customer: 1,
      start_date: "2022-11-11",
      end_date: "2022-11-14",
      code: "SELALUADATOUR",
      amount: 20000000,
      discount_amount: 1100000,
      quantity: null,
      free_quantity: null,
      active: true,
      createdAt: "2022-11-10T08:45:00.473Z",
      updatedAt: "2022-11-10T13:12:11.966Z",
      publishedAt: "2022-11-10T08:45:00.465Z",
      is_specific: true,
      description: "dsfalsdfja",
      duration: 3,
      isDownPayment: false,
      isDisplay: true,
    },
  };
  const { data, isLoading } = useQuery(["getPromos", isPayment], async () => {
    try {
      let response;
      // if (isFromTour) {
      //   response = await getPromoListTour();
      // }
      if (isPayment || isFromTour) {
        response = await getPromoPayment(category || null);
      } else {
        response = await getAllPromoList(category);
      }
      return Promise.resolve(response);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  });

  useEffect(() => {
    if (dataTransaction?.promo_code && dataTransaction?.discountPromo > 0) {
      setSelected(dataTransaction?.promo_code);
    }
  }, [dataTransaction]);

  const handleOpen = () => {
    if (!dataTransaction?.promo_code) {
      onOpen();
    }
  };
  return (
    <>
      <HStack
        as={Button}
        justifyContent="space-between"
        alignItems="center"
        py="16px"
        height={"full"}
        bg="brand.blue.100"
        borderRadius="4px"
        onClick={handleOpen}
        style={{
          cursor: !dataTransaction?.promo_code ? "pointer" : "default",
        }}
      >
        <HStack alignItems="center">
          <Image
            src="/svg/nav/products.svg"
            alt="products"
            width={24}
            height={24}
          />
          <Text
            fontWeight={"normal"}
            fontSize={{ base: "lg", md: "md" }}
            color={!selected && "neutral.text.low"}
            textTransform={selected && "uppercase"}
          >
            {selected ?? "Masukkan Kode Promo"}
          </Text>
        </HStack>
        <Button
          // as={Button}
          variant={"unstyled"}
          fontSize={{ base: "sm", md: "md" }}
          color="brand.blue.400"
        >
          Terapkan
        </Button>
      </HStack>
      <CustomFilterButton
        drawer={drawerRef}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        title={"Pilih Promo"}
        notrounded
      >
        <Box py="16px">
          <Formik
            initialValues={{ code: "", category: category }}
            onSubmit={handleSubmit}
            validationSchema={Yup.object({
              code: Yup.string().required("Kode Promo harus diisi"),
            })}
          >
            <Form>
              <Field name="code">
                {({ field, form }) => (
                  <InputGroup size="lg">
                    <InputLeftElement>
                      <Image
                        src="/svg/nav/products.svg"
                        alt="products"
                        width={24}
                        height={24}
                      />
                    </InputLeftElement>
                    <Input
                      {...field}
                      disabled={mutation.isLoading}
                      type="text"
                      variant="filled"
                      placeholder="Masukkan kode promo"
                    />
                    <InputRightElement w="fit-content" px="8px">
                      <Button
                        isLoading={mutation.isLoading}
                        disabled={mutation.isLoading}
                        type="submit"
                        mx={"12px"}
                        variant={"unstyled"}
                        fontSize={{ base: "sm", md: "md" }}
                        color="brand.blue.400"
                      >
                        Tambah
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                )}
              </Field>
            </Form>
          </Formik>
        </Box>
        <Stack
          mx="-24px"
          p="24px"
          minH="75vh"
          spacing="12px"
          bg="brand.blue.100"
        >
          {isSpesificPromo && (
            <HStack
              position="relative"
              bg="white"
              alignItems="center"
              justifyContent="space-between"
              px="25px"
              pt="18px"
              pb="13px"
              onClick={() => {
                setSelected(promoHardcode.attributes.code);
                handlePromo(promoHardcode.attributes.code);
              }}
            >
              <Circle
                position="absolute"
                left="-8px"
                size="16px"
                bg="brand.blue.100"
              />
              <Circle
                position="absolute"
                right="-8px"
                size="16px"
                bg="brand.blue.100"
              />
              <Stack spacing={0.75}>
                <Text
                  pt="4px"
                  color="brand.blue.400"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {promoHardcode.attributes.name}
                </Text>
                <Text fontSize={{ base: "lg", md: "md" }} fontWeight="bold">
                  {promoHardcode.attributes.name}
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color="neutral.text.medium"
                >
                  Valid hingga{" "}
                  {convertDateWithMonthName(promoHardcode.attributes.end_date)}
                </Text>
                <TNCDrawer html={promoHardcode.attributes?.tnc || ""} />
              </Stack>
              <Radio
                colorScheme="brand.blue"
                isChecked={selected === promoHardcode.attributes.code}
              />
            </HStack>
          )}
          {mutation.isSuccess && (
            <HStack
              position="relative"
              bg="white"
              alignItems="center"
              justifyContent="space-between"
              px="25px"
              pt="18px"
              pb="13px"
              onClick={() => {
                setSelected(mutation.data.code);
                handlePromo(mutation.data.code);
              }}
            >
              <Circle
                position="absolute"
                left="-8px"
                size="16px"
                bg="brand.blue.100"
              />
              <Circle
                position="absolute"
                right="-8px"
                size="16px"
                bg="brand.blue.100"
              />
              <Stack spacing={0.75}>
                <Text
                  pt="4px"
                  color="brand.blue.400"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {mutation.data.promo.name}{" "}
                  <Badge colorScheme="green" size="10px">
                    KODE UNIK
                  </Badge>
                </Text>
                <Text fontSize={{ base: "lg", md: "md" }} fontWeight="bold">
                  <Box
                    dangerouslySetInnerHTML={{
                      __html:
                        mutation?.data?.promo?.description ||
                        mutation.data.promo.name,
                    }}
                  />
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color="neutral.text.medium"
                >
                  Valid hingga{" "}
                  {convertDateWithMonthName(mutation.data.promo.end_date)}
                </Text>
                <TNCDrawer html={mutation.data.promo?.tnc || ""} />
              </Stack>
              <Radio
                colorScheme="brand.blue"
                isChecked={selected == mutation.data.code}
              />
            </HStack>
          )}
          {!isLoading ? (
            data?.map((item, index) => (
              <>
                {item.attributes.code != promoHardcode.attributes.code && (
                  <HStack
                    key={index}
                    position="relative"
                    bg="white"
                    alignItems="center"
                    justifyContent="space-between"
                    px="25px"
                    pt="18px"
                    pb="13px"
                    onClick={() => {
                      setSelected(item.attributes.code);
                      handlePromo(item.attributes.code);
                    }}
                  >
                    <Circle
                      position="absolute"
                      left="-8px"
                      size="16px"
                      bg="brand.blue.100"
                    />
                    <Circle
                      position="absolute"
                      right="-8px"
                      size="16px"
                      bg="brand.blue.100"
                    />
                    <Stack spacing={0.75}>
                      <Text
                        pt="4px"
                        color="brand.blue.400"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        {item.attributes.name}
                      </Text>
                      <Text
                        fontSize={{ base: "lg", md: "md" }}
                        fontWeight="bold"
                      >
                        <Box
                          dangerouslySetInnerHTML={{
                            __html:
                              item?.attributes?.description ||
                              item.attributes.name,
                          }}
                        />
                      </Text>
                      <Text
                        fontSize={{ base: "sm", md: "md" }}
                        color="neutral.text.medium"
                      >
                        Valid hingga{" "}
                        {convertDateWithMonthName(item.attributes.end_date)}
                      </Text>
                      <TNCDrawer html={item.attributes?.tnc || ""} />
                    </Stack>
                    <Radio
                      colorScheme="brand.blue"
                      isChecked={selected === item.attributes.code}
                    />
                  </HStack>
                )}
              </>
            ))
          ) : (
            <Spinner></Spinner>
          )}
        </Stack>
      </CustomFilterButton>
    </>
  );
};

export const FormPerson = ({
  item,
  handleTraveler,
  index,
  isDomestic = false,
  title = "Data Traveler",
  isAttraction = false,
  isInsurance = false,
  isCruises = false,
  customFields = null,
  customForm = null,
  customValidation = null,
  isKTP = false,
  isLackField,
  ...props
}) => {
  // const drawerRef = useRef();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const defaultForm = {
    title: item.paxType == "ADT" ? "Mrs" : "Miss",
    first_name: "",
    last_name: "",
    dob: date(addYears(new Date(), -21), "yyyy-MM-dd"),
    country: "",
    passport_number: "",
    publisher_country: "",
    expired_date: "",
  };
  if (item?.passport_number === null) {
    item.passport_number = "";
  }
  if (isAttraction) {
    defaultForm = {
      ...props.dynamicForm?.reduce((prev, val) => {
        return { ...prev, [val.name]: "" };
      }, {}),
    };
  }

  const defaultYupValidation = {
    title: Yup.string().required("Title harap diisi"),
    first_name: Yup.string().required("Nama depan harap diisi"),
    last_name: Yup.string().notRequired(),
    dob: Yup.date()
      .max(
        date(new Date().setDate(new Date().getDate() - 1), "yyyy-MM-dd"),
        "Mohon isi dengan sesuai"
      )
      .required("Tanggal lahir harap diisi"),
    country: Yup.string().required("Negara harap diisi"),
    ...(isDomestic &&
      isKTP && {
        // no ktp di isi jika umur > 17
        passport_number: Yup.string().when("dob", {
          is: (dob) => {
            return differenceInYears(new Date(), new Date(dob)) > 17;
          },
          then: Yup.string().required("Nomor KTP harap diisi"),
          otherwise: Yup.string().notRequired(),
        }),
      }),
    ...(isDomestic
      ? ""
      : {
          passport_number: Yup.string().required("Passport harap diisi"),
          publisher_country: Yup.string().required(
            "Negara penerbit harap diisi"
          ),
          expired_date: Yup.string().required(
            "Tanggal habis berlaku harap diisi"
          ),
        }),
  };

  const fields = [
    {
      name: "title",
      label: "Title",
      type: "radio",
      options: item.paxType == "ADT" ? ["Mr", "Mrs", "Ms"] : ["Miss", "Mstr"],
    },
    [
      {
        name: "first_name",
        label: "Nama Depan",
        type: "text",
      },
      {
        name: "last_name",
        label: "Nama Belakang",
        type: "text",
      },
    ],
    ...(isAttraction
      ? [
          {
            name: "dob",
            label: "Email",
            type: "email",
          },
        ]
      : [
          {
            name: "dob",
            label: "Tanggal Lahir",
            type: "date",
          },
        ]),
    ...(isKTP && isDomestic
      ? [
          {
            name: "passport_number",
            label: "Nomor KTP",
            type: "text",
          },
        ]
      : ""),
    {
      name: "country",
      label: "Kewarganegaraan",
      type: "select",
      options: countries,
    },
    ...(isAttraction
      ? [
          {
            name: "passport_number",
            label: "Nomor Telepon",
            type: "text",
          },
        ]
      : isDomestic
      ? ""
      : [
          {
            name: "passport_number",
            label: "Nomor Passport",
            type: "text",
          },
          {
            name: "publisher_country",
            label: "Negara Penerbit",
            type: "select",
            options: countries,
          },
          {
            name: "expired_date",
            label: "Tanggal Habis Berlaku",
            type: "date",
          },
        ]),
  ];

  // if(isCruises){

  // }

  if (isAttraction) {
    defaultYupValidation = {
      ...props.dynamicForm?.reduce((prev, val) => {
        return {
          ...prev,
          [val.name]: Yup.string().when([], {
            is: val.required,
            then: Yup.string().required(`${val.label} Harap Diisi`),
            otherwise: Yup.string().notRequired(),
          }),
        };
      }, {}),
    };
  }

  if (isInsurance) {
    defaultForm = {
      first_name: "",
      last_name: "",
      gender: "Male",
      birthplace: "",
      dob: addYears(new Date(), -24),
      email: "",
      address: "",
      ...(index === 0
        ? {
            phone: "",
            city: "",
            TravelNeedID: "",
            title: "",
          }
        : {}),
      relationship: index === 0 ? "Primary" : "",
      passport_type: "KTP",
      publisher_country: "",
      passport: "",
    };
    defaultYupValidation = {
      first_name: Yup.string().required("Nama Depan harap diisi"),
      last_name: Yup.string().notRequired(),
      gender: Yup.string().required("Gender harap diisi"),
      birthplace: Yup.string().required("Tempat Lahir harap diisi"),
      dob: Yup.date().required("Tanggal Lahir harap diisi"),
      address: Yup.string().required("Alamat harap diisi"),
      passport: Yup.string().required("Passport harap diisi"),
      publisher_country: Yup.string().required("Negara Penerbit harap diisi"),
      relationship: Yup.string().required("Hubungan harap diisi"),
      ...(index === 0
        ? {
            title: Yup.string().required("Title harap diisi"),
            email: Yup.string().email().required("Email harap diisi"),
            phone: Yup.number().required("Nomor Telepon harap diisi"),
            city: Yup.string().required("Kota harap diisi"),
            TravelNeedID: Yup.string().required("Keperluan harap diisi"),
          }
        : {
            email: Yup.string().email().notRequired(),
          }),
    };
  }

  if (customForm) {
    defaultForm = customForm;
  }

  if (customFields) {
    fields = customFields;
  }
  if (isAttraction) {
    fields = props.dynamicForm;
  }
  if (customValidation) {
    defaultYupValidation = customValidation;
  }

  const [form, setForm] = useState({
    i: item.i,
    key: index,
    paxType: item.paxType,
    ...defaultForm,
  });

  const handleSubmit = async (values, actions) => {
    try {
      if (isAttraction) {
        new Promise(async (resolve, reject) => {
          try {
            _.mapObject(values, async (value, key) => {
              if (typeof value === "object") {
                const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
                const responseImage = value && (await uploadFile(value));
                if (!responseImage) return reject(responseImage);
                values[key] = responseImage.url;
                // return resolve(value = responseImage.id);
                // resolve(response);
              }
            });
          } catch (error) {
            reject(error);
          }
        });
      }
      setForm({ ...form, ...values });
      handleTraveler(values);
      actions.setSubmitting(false);
      await actions.setStatus("Done");
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);

      return Promise.reject(error);
    }
  };

  const pulseErrorBorder = keyframes`
    0% {
      border-color: #e53e3e;
    }
    50% {
      border-color: #fff;
    }
    100% {
      border-color: #e53e3e;
    }
  `;

  useEffect(() => {
    if (item) {
      setForm({ ...form, ...item });
    }
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  const SubmitButton = () => {
    const { submitForm, isSubmitting } = useFormikContext();
    return (
      <CustomOrangeFullWidthButton
        mt={0}
        isLoading={isSubmitting}
        // onClose={onClose}
        type={"submit"}
        onClick={() => {
          submitForm().then((val) => {
            val === true && onClose();
          });
        }}
      >
        Simpan Data Penumpang
      </CustomOrangeFullWidthButton>
    );
  };

  return (
    <>
      <Button
        variant={"unstyled"}
        fontSize={{ base: "sm", md: "md" }}
        color="brand.blue.400"
        px={2}
        fontWeight="semibold"
        borderWidth="2px"
        borderColor="transparent"
        animation={
          isLackField
            ? `${pulseErrorBorder} 1s ease-in-out infinite`
            : undefined
        }
        onClick={onOpen}
      >
        {!_.some(_.values(form)) ? "Ubah" : "Isi Data"}
      </Button>
      <Formik
        validationSchema={Yup.object().shape({
          paxType: Yup.string().required(),
          ...defaultYupValidation,
        })}
        initialValues={form}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <CustomFilterButton
            notrounded
            // drawer={drawerRef}
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            footer={<SubmitButton />}
            title={title}
            // hideFooter
          >
            <Stack spacing={"12px"}>
              <Box>
                <Text fontSize={{ base: "lg", md: "md" }} fontWeight="semibold">
                  Informasi Penumpang (
                  {isInsurance
                    ? index === 0
                      ? "Insured Person"
                      : `Other Person ${index}`
                    : travelerType(item.paxType)}
                  ) <span style={{ color: "red" }}>*</span>
                </Text>
                <Text color="neutral.text.medium">
                  {isDomestic
                    ? `Pastikan data Anda sesuai dengan ${
                        item.paxType == "ADT" ? "KTP" : "NIK"
                      }`
                    : " Pastikan data Anda sesuai dengan KTP/Paspor/SIM"}
                </Text>
              </Box>
              {/* <Badge
                variant="unstyled"
                fontWeight="regular"
                textTransform="none"
                bg="brand.blue.400"
                mt="12px"
                mb="24px"
                color="white"
              >
                Tiket Internasional
              </Badge> */}
              <Box>
                <GlobalForm
                  person={item}
                  fields={
                    customFields
                      ? isInsurance
                        ? customFields
                            .filter((item) => {
                              return (
                                item.name !== "passport_type" &&
                                item.name !== "passport" &&
                                item.name !== "publisher_country"
                              );
                            })
                            .filter((item) => {
                              if (index !== 0) {
                                return (
                                  item.name !== "TravelNeedID" &&
                                  item.name !== "title"
                                );
                              } else if (index === 0) {
                                return item.name !== "relationship";
                              } else return item;
                            })
                        : customFields
                      : isAttraction
                      ? fields
                      : isKTP && isDomestic
                      ? fields.slice(0, 5)
                      : fields.slice(0, 4)
                  }
                />
              </Box>
              {!isDomestic && (
                <>
                  <Box py="12px">
                    <Text
                      fontSize={{ base: "lg", md: "md" }}
                      fontWeight="semibold"
                    >
                      Informasi Identitas{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Text>
                    <Text color="neutral.text.medium">
                      Pastikan masa berlaku paspor setidaknya 6 bulan dari
                      tanggal keberangkatan
                    </Text>
                  </Box>
                  <Box py={"24px"}>
                    <GlobalForm
                      person={item}
                      fields={
                        isInsurance
                          ? fields.filter((item) => {
                              return (
                                item.name === "passport_type" ||
                                item.name === "passport" ||
                                item.name === "publisher_country"
                              );
                            })
                          : fields.slice(4, fields.length)
                      }
                    />
                  </Box>
                </>
              )}
            </Stack>
          </CustomFilterButton>
        </Form>
        {/* {({ isSubmitting, submitForm, status }) => (
        )} */}
      </Formik>
    </>
  );
};

export const ContactInfo = ({ handleChange }) => {
  const { isLoggedIn, user } = useSelector((s) => s.authReducer);
  const users = {
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
  };
  return (
    <Box>
      <Text fontSize={{ base: "sm", md: "md" }} color="neutral.text.medium">
        Pastikan semua data yang anda berikan benar dan bisa di hubungi.
      </Text>
      {/* <FormControl
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        py={4}
      >
        <FormLabel
          htmlFor="same-data"
          fontSize={{ base: "sm", md: "md" }}
          color="neutral.text.medium"
        >
          Sama dengan data akun
        </FormLabel>
        <Switch id="same-data" colorScheme="brand.blue" size="lg" />
      </FormControl> */}
      <Stack spacing={5} pt={6}>
        <Divider variant={"dashed"} />
        {[
          { l: "fullName", n: "Nama Lengkap", t: "text", r: true },
          { l: "email", n: "Email", t: "email", r: true },
          { l: "phone", n: "Nomor Telepon", t: "tel", r: true },
        ].map((item, index) => (
          <FormControl key={index} isRequired={item.r}>
            <FormLabel
              htmlFor={item.l}
              fontSize={{ base: "xs", md: "sm" }}
              color="neutral.text.medium"
            >
              {item.n}
            </FormLabel>
            <Input
              py={"15px"}
              id={item.l}
              name={item.l}
              type={item.t}
              color={"neutral.text.high"}
              placeholder={`Isi ${item.n}`}
              variant="filled"
              fontSize={{ base: "xs", md: "sm" }}
              onChange={(e) => handleChange(e, "customer")}
              value={isLoggedIn ? users[item.l] : null}
              disabled={isLoggedIn}
            />
          </FormControl>
        ))}
      </Stack>
    </Box>
  );
};
